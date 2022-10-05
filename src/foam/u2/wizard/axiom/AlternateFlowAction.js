/**
 * @license
 * copyright 2022 the foam authors. all rights reserved.
 * http://www.apache.org/licenses/license-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.axiom',
  name: 'AlternateFlowAction',
  extends: 'foam.u2.wizard.axiom.WizardAction',

  properties: [
    {
      name: 'name',
      expression: function (alternateFlow) {
        return alternateFlow.name;
      }
    },
    {
      name: 'label',
      expression: function (alternateFlow) {
        return alternateFlow.label;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'alternateFlow'
    },
    {
      name: 'code',
      value: function (slot, action) {
        const wizardController = slot.data$.get();
        action.alternateFlow.execute((wizardController.data || wizardController).__subContext__);
        action.alternateFlow.handleNext(wizardController);
      }
    },
    {
      name: 'buttonStyle',
      expression: function (alternateFlow) {
        return alternateFlow.buttonStyle;
      }
    }
  ]
})
