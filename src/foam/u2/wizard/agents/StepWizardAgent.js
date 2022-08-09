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
    'config? as importedConfig',
    'popupMode',
    'flowAgent?',
    'stack',
    'wizardController?'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.stack.StackBlock',
    'foam.u2.wizard.ScrollingStepWizardView',
    'foam.u2.wizard.StepWizardConfig'
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.StepWizardConfig',
      factory: function() {
        return this.importedConfig || this.StepWizardConfig.create();
      }
    },
    'wizardStackBlock'
  ],

  methods: [
    async function execute() {
      if ( ! this.wizardController || ! this.config ) 
        console.warn('Missing controller or config');
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
      view.onClose = this.resolveAgent;

      if ( (view?.class || view?.cls_?.id).endsWith('ScrollingStepWizardView') ) {
        this.wizardController.autoPositionUpdates = false;
      }

      this.wizardStackBlock = this.StackBlock.create({
        view, ...(this.popupMode ? { popup: this.config.popup || {} } : {}),
        parent: this
      });

      await new Promise(resolve => {
        this.wizardStackBlock.removed.sub(() => {
          resolve();
        })
        this.flowAgent?.sub(this.cls_.name,() => {
          resolve();
        })
        this.stack.push(this.wizardStackBlock);
      });
    }
  ],
  listeners: [
    function resolveAgent() {
      if ( this.stack.BACK.isEnabled(this.stack.pos) )
        this.stack.back();
      else
        // This is temporarily necessary to fake a StackBlock removal
        // in case the stack is empty when the wizard is pushed.
        this.wizardStackBlock.removed.pub();
    }
  ]
});
