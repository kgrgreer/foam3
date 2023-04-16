/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'AlternateFlowSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  documentation: `
    Used to execute an alternateflow upon saving a wizardlet.
    When using should set wizardlet.goNextOnSave to false
  `,

  imports: [
    'wizardController'
  ],

  requires: [
    'foam.u2.wizard.axiom.AlternateFlowAction'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'alternateFlow'
    }
  ],

  methods: [
    async function save() {
      debugger
      // TODO: investigate when this happens
      if ( ! this.wizardController.goNext ) {
        this.alternateFlow.execute(this.__subContext__);
        return;
      }

      var action = this.AlternateFlowAction.create({
        alternateFlow: this.alternateFlow,
        isEnabled: function () { return true; },
        isAvailable: function () { return true; }
      });
      var x = this.__subContext__.createSubContext({ data: this.wizardController });
      action.maybeCall(x, this.wizardController);
      return this.delegate.save.call(this, arguments);
    }
  ]
});