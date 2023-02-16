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
        // If alternateFlow was specified in a journal it needs a relevant context
        // ???: Maybe the alternateFlow property should be an FObjectSpec instead
        if ( action.alternateFlow.__context__ != action.__subContext__ ) {
          action.alternateFlow = action.alternateFlow.clone(action.__subContext__);
        }

        // Get the StepWizardController
        let wizardController = slot.data$.get();
        wizardController = wizardController.data || wizardController;

        // only set inaltflow if using altflowwao since it is the only place where this boolean is used
        if ( wizardController.currentWizardlet.useAltFlowWAO ) wizardController.currentWizardlet.isInAltFlow = true;
        action.alternateFlow.execute((wizardController.data || wizardController).__subContext__);
        action.alternateFlow.handleNext(wizardController);
      }
    },
    {
      name: 'buttonStyle',
      expression: function (alternateFlow) {
        return alternateFlow.buttonStyle;
      }
    },
    {
      name: 'icon',
      expression: function (alternateFlow) {
        return alternateFlow.icon;
      }
    }
  ]
})
