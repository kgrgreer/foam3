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
      var action = this.AlternateFlowAction.create({ alternateFlow: this.alternateFlow });
      var x = this.__subContext__.createSubContext({ data: this.wizardController });
      action.maybeCall(x, this.wizardController);
    }
  ]
});