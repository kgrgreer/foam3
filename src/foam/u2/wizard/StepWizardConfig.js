/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardConfig',

  implements: [
    'foam.core.ContextAware'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'allowSkipping',
      documentation: `
        Allow skipping sections without completing them in incremental wizards.
      `
    },
    {
      class: 'Boolean',
      name: 'allowBacktracking',
      value: true,
      documentation: `
        Allow going back to previous sections in incremental wizards.
      `
    },
    {
      class: 'Boolean',
      name: 'requireAll',
      documentation: `
        Require all sections to be valid to invoke wizard completion (done button).
      `
    },
    {
      class: 'Boolean',
      name: 'rejectOnInvalidatedSave',
      documentation: `
        Set to true when ScrollingWizard is used in association with an Approval Request
        and requires the approval request to be rejected if invalidated data is saved.
      `,
      value: false
    },
    {
      class: 'foam.util.FObjectSpec',
      name: 'controller',
      factory: function() {
        return { class: 'foam.u2.wizard.controllers.IncrementalWizardController' };
      }
    },
    {
      deprecated: true,
      class: 'foam.u2.ViewSpec',
      name: 'wizardView',
      flags: ['web'], // Temporary
      documentation: `
        Specify a view to use with this controller.
      `,
      // value: { class: 'foam.u2.wizard.IncrementalStepWizardView' }
      expression: function (controller) {
        if ( controller ) {
          return controller.defaultView;
        }

        return { class: 'foam.u2.wizard.ScrollingStepWizardView' };
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'popup',
      factory: function () {
        return { class: 'foam.u2.dialog.ApplicationPopup' };
      }
    }
  ],

  methods: [
    async function execute(){
      return;
    }
  ]
});
