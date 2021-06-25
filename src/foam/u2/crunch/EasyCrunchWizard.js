/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'EasyCrunchWizard',

  documentation: `
    EasyCrunchWizard is a facade to configure context agents typically found
    in a CRUNCH wizard sequence.
  `,

  requires: [
    'foam.u2.crunch.wizardflow.SkipGrantedAgent',
    'foam.u2.crunch.wizardflow.SkipMode',
    'foam.u2.wizard.StepWizardConfig'
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
      name: 'skipMode',
      class: 'Enum',
      of: 'foam.u2.crunch.wizardflow.SkipMode',
      factory: function () {
        return this.SkipMode.SKIP;
      }
    },
    {
      name: 'incrementalWizard',
      class: 'Boolean',
      documentation: `
        Set this to true to use the incremental wizard, which shows sections
        on separate screens, instead of the default scrolling wizard.
      `
    },
    {
      class: 'String',
      name: 'view',
      value: 'foam.nanos.crunch.ui.UCJView'
    },
    {
      class: 'Boolean',
      name: 'rejectOnInvalidatedSave',
      documentation: `
        Set to true when ScrollingWizard is used in association with an Approval Request
        and requires the approval request to be rejected if invalidated data is saved.
      `,
    },
    {
      class: 'Boolean',
      name: 'requireAll',
      documentation: `
        Require all sections to be valid to invoke wizard completion (done button).
      `
    }
  ],

  methods: [
    function applyTo(sequence) {
      var config = this.StepWizardConfig.create({
        allowSkipping: this.allowSkipping,
        allowBacktracking: this.allowBacktracking,
        rejectOnInvalidatedSave: this.rejectOnInvalidatedSave,
        requireAll: this.requireAll,
        ...(this.incrementalWizard ? {
          wizardView: { class: 'foam.u2.wizard.IncrementalStepWizardView' }
        } : {})
      });
      sequence.reconfigure('StepWizardAgent', { config: config });
      if ( this.skipMode )
        sequence.reconfigure('SkipGrantedAgent', {
          mode: this.skipMode });
      if ( this.statelessWizard )
        sequence.remove('WizardStateAgent');
    },
    async function execute () {
      // Subclasses which fetch information asynchronously can override this
    }
  ]
});
