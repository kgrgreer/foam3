/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'TestWizard',
  extends: 'foam.nanos.menu.AbstractMenu',

  imports: [
    'crunchController'
  ],

  exports: [
    'fakeCapabilityDAO as capabilityDAO',
    'fakePrerequisiteCapabilityDAO as prerequisiteCapabilityJunctionDAO'
  ],

  requires: [
    'foam.dao.ArrayDAO',
    'foam.u2.wizard.agents.RootCapabilityAgent',
    'foam.u2.crunch.wizardflow.LoadCapabilityGraphAgent',
    'foam.u2.crunch.wizardflow.GraphWizardletsAgent',
    'foam.u2.wizard.debug.scenarios.MinMaxChoicePrereqLiftScenario',
    'foam.util.async.Sequence'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'fakeCapabilityDAO',
      factory: function () {
        return this.ArrayDAO.create({
          of: 'foam.nanos.crunch.Capability',
          array: this.scenario.capabilities
        });
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'fakePrerequisiteCapabilityDAO',
      factory: function () {
        return this.ArrayDAO.create({
          of: 'foam.nanos.crunch.CapabilityCapabilityJunction',
          array: this.scenario.capabilityCapabilityJunctions
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.debug.TestWizardScenario',
      name: 'scenario',
      factory: function () {
        return this.MinMaxChoicePrereqLiftScenario.create();
      }
    }
  ],

  methods: [
    function launch(X) {
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
        ;
      console.log(sequence.contextAgentSpecs.map(spec => spec.name))
      sequence.execute();
    }
  ]
});
