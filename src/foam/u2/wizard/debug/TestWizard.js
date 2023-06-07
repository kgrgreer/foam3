/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'TestWizardMenu',
  extends: 'foam.nanos.menu.Menu',

  imports: [
    'stack'
  ],

  requires: [
    'foam.dao.ArrayDAO',
    'foam.nanos.menu.Menu',
    'foam.u2.wizard.debug.TestWizardScenarioMenu'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'packages',
      factory: () => ['foam.u2.wizard.debug.scenarios']
    },
    {
      name: 'children_',
      factory: function () {
        const scenarioMenus = [];

        scenarioMenus.push(this.Menu.create({
          id: this.id + '/ElementWizardTest',
          label: 'Element Wizard Test',
          parent: this.id,
          handler: foam.nanos.menu.ViewMenu.create({
            view: { class: 'net.nanopay.cards.test.wizards.ElementTest' }
          }, this)
        }));

        for ( const packageString of this.packages ) {
          const pkg = packageString.split('.').reduce((o, k) => o?.[k], globalThis);
          if ( pkg === undefined ) throw new Error(
            `could not load wizard scenarios from: ${packageString}`);
          scenarioMenus.push(...Object.getOwnPropertyNames(pkg).map(scenarioName =>
            this.Menu.create({
              id: this.id + '/' + scenarioName,
              label: foam.String.labelize(scenarioName),
              parent: this.id,
              handler: this.TestWizardScenarioMenu.create({
                scenarioCls: pkg[scenarioName]
              })
            })
          ));
        }
        
        return this.ArrayDAO.create({ array: scenarioMenus });
      }
    },
    {
      name: 'children',
      // Use getter instead of factory to have higher precedence
      // than than 'children' factory from relationship
      getter: function() { return this.children_; }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'TestWizardScenarioMenu',
  extends: 'foam.nanos.menu.AbstractMenu',

  imports: [
    'crunchController',
    'stack'
  ],

  exports: [
    'fakeCapabilityDAO as capabilityDAO',
    'fakePrerequisiteCapabilityDAO as prerequisiteCapabilityJunctionDAO'
  ],

  requires: [
    'foam.dao.ArrayDAO',
    'foam.u2.crunch.wizardflow.LoadCapabilityGraphAgent',
    'foam.u2.crunch.wizardflow.GraphWizardletsAgent',
    'foam.u2.stack.StackBlock',
    'foam.u2.wizard.agents.RootCapabilityAgent',
    'foam.u2.wizard.debug.scenarios.MinMaxChoicePrereqLiftScenario',
    'foam.util.async.Sequence'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'fakeCapabilityDAO',
      flags: ['web'],
      expression: function (scenario) {
        return this.ArrayDAO.create({
          of: 'foam.nanos.crunch.Capability',
          array: scenario.capabilities
        });
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'fakePrerequisiteCapabilityDAO',
      flags: ['web'],
      expression: function (scenario) {
        return this.ArrayDAO.create({
          of: 'foam.nanos.crunch.CapabilityCapabilityJunction',
          array: scenario.capabilityCapabilityJunctions
        });
      }
    },
    {
      class: 'Class',
      name: 'scenarioCls',
      flags: ['web']
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.debug.TestWizardScenario',
      name: 'scenario',
      flags: ['web'],
      expression: function (scenarioCls) {
        if ( ! scenarioCls ) return null;
        return scenarioCls.create({}, this);
      }
    }
  ],

  methods: [
    function launch(X) {
      this.launch_(X);
    },
    async function launch_(X) {
      X = X.createSubContext({
        capabilityDAO: this.fakeCapabilityDAO,
        prerequisiteCapabilityJunctionDAO: this.fakePrerequisiteCapabilityDAO
      });
      const sequence = this.crunchController.createTransientWizardSequence(X)
        .addBefore('ConfigureFlowAgent', this.RootCapabilityAgent, {
          rootCapability: 'Entry'
        })
        .addBefore('CreateWizardletsAgent', this.LoadCapabilityGraphAgent)
        .addBefore('CreateWizardletsAgent', this.GraphWizardletsAgent)
        .remove('CreateWizardletsAgent')
        .remove('GrantedEditAgent')
        .remove('CapabilityStoreAgent')
        ;
      this.scenario.installInSequence(sequence);
      await sequence.execute();
    }
  ]
});