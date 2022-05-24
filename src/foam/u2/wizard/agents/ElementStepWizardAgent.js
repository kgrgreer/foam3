/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'ElementStepWizardAgent',
  extends: 'foam.u2.wizard.agents.StepWizardAgent',
  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],
  documentation: `Renders a wizardView using current controller in an Element`,

  imports: [
    'elSlot?',
    'detachListener?',
    'flowAgent?'
  ],

  properties: [
    {
      name: 'resolved_',
      documentation: 'Used to store and detach contextAgent listener'
    }
  ],
  methods: [
    async function execute() {
      if ( ! this.elSlot ) {
        console.warn('missing element');
        return;
      }
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

      const v = foam.u2.ViewSpec.createView(view, {}, this, this.__subContext__);

      this.elSlot.removeAllChildren();
      this.elSlot.add(v);

      await new Promise(resolve => {
        this.resolved_ = this.flowAgent?.sub(this.cls_.name, () => {
          resolve();
          this.resolveAgent();
        });
      });
    }
  ],
  listeners: [
    function resolveAgent() {
      this.elSlot.removeAllChildren();
      this.detachListener?.pub('res');
      this.resolved_?.detach();
    }
  ]
});