/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'StepWizardAgent',
  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],
  documentation: `
    Opens the wizard. The scrolling wizard is used by default, but the provided
    config object may specify the incremental wizard to be used instead.
  `,

  imports: [
    'ctrl',
    'initialPosition?',
    'popView',
    'popupMode',
    'pushView',
    'stack',
    'wizardlets'
  ],

  exports: [
    'wizardController',
    'submitted'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.stack.StackBlock',
    'foam.u2.wizard.StepWizardConfig',
    'foam.u2.wizard.StepWizardController'
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

      const usingFormController = this.config && this.config.controller;

      const view = usingFormController ? {
        // new approach
        ...this.config.controller,
        view: this.config.wizardView 
      } : {
        // deprecated
        ...this.config.wizardView
      };

      view.data = this.wizardController;
      view.onClose = this.stack.back.bind(this.stack);

      const wizardStackBlock = this.StackBlock.create({
        view, ...(this.popupMode ? { popup: {} } : {})
      });

      await new Promise(resolve => {
        wizardStackBlock.removed.sub(() => {
          resolve();
        })
        this.stack.push(wizardStackBlock);
      });
    }
  ]
});
