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
    'foam.u2.wizard.axiom.AlternateFlowAction',
    'foam.u2.wizard.wao.AlternateFlowWAO'
  ],

  exports: [
    'wizardController'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'choices'
    },
    {
      class: 'Boolean',
      name: 'isInAltFlow',
      documentation: `
        Set to true when executing an alternate flow, and back to false
        after save
      `
    },
    {
      class: 'Boolean',
      name: 'useAltFlowWAO',
      documentation: `
        When true wraps WAO in an AlternateFlowWAO
      `
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( this.choices ) {
        var choices = this.choices.map(alternateFlow => {
          var action = this.AlternateFlowAction.create({ alternateFlow });
          if ( alternateFlow.canSkipData ) {
            action.isEnabled = function(isLoading_) { return !isLoading_ };
          }
          return action;
        });
        this.dynamicActions = this.dynamicActions.concat(choices);
      }
      if ( this.useAltFlowWAO && ! this.AlternateFlowWAO.isInstance(this.wao) ) {
        this.wao = this.AlternateFlowWAO.create({ delegate: this.wao }, this.__subContext__);
      }
    }
  ]
});
