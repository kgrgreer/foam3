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
    'crunchController?',
    'ctrl',
    'config? as importedConfig',
    'popupMode',
    'flowAgent?',
    'stack',
    'wizardClosing',
    'wizardController?'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.u2.stack.StackBlock',
    'foam.u2.wizard.ScrollingStepWizardView',
    'foam.u2.wizard.StepWizardConfig',
    'foam.u2.wizard.WizardStatus'
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
    'wizardStackBlock',
    'lastLastActiveWizard'
  ],

  methods: [
    async function execute() {
      const view = {
        ...this.wizardController.defaultView,
        data: this.wizardController
      };


      this.onDetach(this.wizardController.status$.sub(() => {
        const v = this.wizardController.status;
        if ( v == this.WizardStatus.IN_PROGRESS ) return;
        this.resolveAgent();
        this.wizardController.onClose();
      }));

      if ( (view?.class || view?.cls_?.id).endsWith('ScrollingStepWizardView') ) {
        this.wizardController.autoPositionUpdates = false;
      }

      if ( this.wizardController.setFirstPosition ) {
        await this.wizardController.setFirstPosition();
      }

      this.wizardStackBlock = this.StackBlock.create({
        view, ...(this.popupMode ? { popup: this.config.popup || {} } : {}),
        parent: this
      });

      await new Promise((resolve, onError) => {
        this.onDetach(this.wizardController.lastException$.sub(() => {
          let e = this.wizardController.lastException;
          if ( ! e ) return;
          onError(e);
        }));

        this.wizardStackBlock.removed.sub(() => {
          this.crunchController.lastActiveWizard = this.lastLastActiveWizard;
          this.wizardClosing = true;
          if ( this.wizardController.status == this.WizardStatus.IN_PROGRESS ) {
            this.wizardController.status = this.WizardStatus.DISCARDED;
          }
          resolve();
        })

        // If this is published to, wizard status will stay IN_PROGRESS
        this.flowAgent?.sub(this.cls_.name,() => {
          resolve();
        })

        if ( this.crunchController ) {
          this.lastLastActiveWizard = this.crunchController.lastActiveWizard;
          this.crunchController.lastActiveWizard = this.wizardController;
        }
        this.stack.push(this.wizardStackBlock);
      });
    }
  ],
  listeners: [
    function resolveAgent() {
      if ( this.wizardClosing ) return;
      this.wizardClosing = true;
      if ( this.stack.BACK.isEnabled(this.stack.pos) )
        this.stack.back();
      else
        // This is temporarily necessary to fake a StackBlock removal
        // in case the stack is empty when the wizard is pushed.
        this.wizardStackBlock.removed.pub();
    }
  ]
});
