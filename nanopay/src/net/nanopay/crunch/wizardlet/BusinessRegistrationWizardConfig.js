/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.crunch.wizardlet',
  name: 'BusinessRegistrationWizardConfig',
  extends: 'foam.u2.crunch.EasyCrunchWizard',

  implements: [
    'foam.core.ContextAware',
    'foam.mlang.Expressions'
  ],

  methods: [
    {
      name: 'applyTo',
      flags: ['web'],
      code: function applyTo(sequence) {
        this.SUPER(sequence);
        let config = sequence.get('StepWizardAgent').args.config;
        config.requireAll = true;
        sequence.reconfigure('StepWizardAgent', {
          config: config
        });
      }
    },
    {
      name: 'execute',
      flags: ['web'],
      code: async function execute() {

      }
    }
  ]
});
