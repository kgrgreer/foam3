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
  documentation: 'Creates WizardController',

  requires: [
    'foam.u2.wizard.StepWizardConfig',
    'foam.u2.wizard.controllers.WizardController'
  ],

  imports: [
    'initialPosition?',
    'wizardFlow',
    'wizardlets'
  ],

  exports: [
    'config',
    'submitted',
    'wizardClosing',
    'wizardController'
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
    'wizardController',
    {
      class: 'Boolean',
      name: 'wizardClosing'
    }
  ],
  methods: [
    async function execute() {
      this.wizardController = this.config.controller$create({
        config: this.config,
        wizardlets: this.wizardlets,
        submitted$: this.submitted$,
        ...(this.initialPosition ? {
          wizardPosition: this.initialPosition
        } : {})
      }, this.__subContext__);

      this.wizardFlow.wizardController = this.wizardController;
      this.wizardlets.forEach(v => { v.wizardController$ = this.wizardController$ })
    }
  ]
});
