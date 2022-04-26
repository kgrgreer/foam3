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
      name: 'children_',
      factory: function () {
        // ???: is it possible to ask foam for all models extending TestWizardScenario?
        const scenarios = Object.getOwnPropertyNames(foam.u2.wizard.debug.scenarios);
        
        return this.ArrayDAO.create({
          array: scenarios.map(scenarioName => {
            return this.Menu.create({
              id: this.id + '/' + scenarioName,
              label: foam.String.labelize(scenarioName),
              parent: this.id,
              handler: this.TestWizardScenarioMenu.create({ scenarioName })
            });
          })
        })
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
      expression: function (scenario) {
        return this.ArrayDAO.create({
          of: 'foam.nanos.crunch.CapabilityCapabilityJunction',
          array: scenario.capabilityCapabilityJunctions
        });
      }
    },
    {
      class: 'String',
      name: 'scenarioName'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.debug.TestWizardScenario',
      name: 'scenario',
      expression: function (scenarioName) {
        if ( ! scenarioName ) return null;
        const cls = foam.u2.wizard.debug.scenarios[scenarioName]
        return cls.create({}, this);
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
      await sequence.execute();
    }
  ]
});