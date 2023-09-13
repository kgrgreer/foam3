/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.wizard.axiom',
  name: 'WizardletDataAction',
  extends: 'foam.u2.wizard.axiom.WizardAction',

  documentation: `
    WizardAction that allows use of an action from the data of the current wizardlet
  `,

  properties: [
    {
      class: 'String',
      name: 'actionName'
    },
    {
      name: 'label',
      expression: function(name) {
        return name;
      }
    },
    {
      name: 'code',
      value: function (slot, X) {
        var wizardletData = slot.data.currentWizardlet.data;
        var action = foam.core.Action
          .create(wizardletData[X.actionName], this)
          .copyFrom({ isAvailable: null, isEnabled: null });
        action.maybeCall(slot, wizardletData);
      }
    },
    {
      name: 'isAvailable',
      value: () => true
    },
    {
      name: 'isEnabled',
      value: () => true
    }
  ]
});
