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

  requires: [
    'foam.u2.crunch.wizardflow.SaveAllAgent'
  ],

  methods: [
    {
      name: 'applyTo',
      flags: ['web'],
      code: function applyTo(sequence) {
        this.SUPER(sequence);
        sequence.add(this.SaveAllAgent);
        sequence.remove('PutFinalPayloadsAgent');
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
