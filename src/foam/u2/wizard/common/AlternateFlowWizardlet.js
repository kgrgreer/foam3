/**
 * @license
 * copyright 2022 the foam authors. all rights reserved.
 * http://www.apache.org/licenses/license-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.common',
  name: 'AlternateFlowWizardlet',
  extends: 'foam.u2.wizard.BaseWizardlet',
  implements: ['foam.u2.wizard.DynamicActionWizardlet'],
  documentation: `
    Overrides wizard actions to affect the availability of other wizardlets.
  `,

  requires: [
    'foam.u2.wizard.axiom.AlternateFlowAction'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'choices'
    },
    {
      name: 'dynamicActions',
      expression: function (choices) {
        return choices.map(alternateFlow =>
          this.AlternateFlowAction.create({ alternateFlow }));
      }
    }
  ]
})
