/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'CreateControllerAgent',
  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],
  documentation: 'Add before merge',

  requires: [
    'foam.u2.wizard.StepWizardConfig',
    'foam.u2.wizard.StepWizardController'
  ],

  imports: [
    'initialPosition?',
    'wizardlets'
  ],

  exports: [
    'wizardController',
    'submitted',
    'config'
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.StepWizardConfig',
      factory: function() {
        return this.StepWizardConfig.create();
      }
    },
    {
      name: 'submitted',
      class: 'Boolean'
    },
    'wizardController'
  ],
  methods: [
    async function execute() {
      this.wizardController = this.StepWizardController.create({
        wizardlets: this.wizardlets,
        config: this.config,
        submitted$: this.submitted$,
        ...(this.initialPosition ? {
          wizardPosition: this.initialPosition
        } : {})
      })
    }
  ]
});