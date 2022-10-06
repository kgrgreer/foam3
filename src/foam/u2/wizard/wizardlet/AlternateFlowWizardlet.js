/**
 * @license
 * copyright 2022 the foam authors. all rights reserved.
 * http://www.apache.org/licenses/license-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'AlternateFlowWizardlet',
  extends: 'foam.u2.wizard.wizardlet.BaseWizardlet',
  implements: ['foam.u2.wizard.DynamicActionWizardlet'],
  documentation: `
    Overrides wizard actions to affect the availability of other wizardlets.
  `,

  requires: [
    'foam.u2.wizard.axiom.AlternateFlowAction'
  ],

  exports: [
    'wizardController'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'choices'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( this.choices ) {
        var choices = this.choices.map(alternateFlow => 
          this.AlternateFlowAction.create({ alternateFlow }));
        this.dynamicActions = this.dynamicActions.concat(choices);
      }
    }
  ]
});
