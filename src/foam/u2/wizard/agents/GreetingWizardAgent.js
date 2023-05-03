/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'GreetingWizardAgent',
  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],
  documentation: `
    Opens the wizard. The scrolling wizard is used by default, but the provided
    config object may specify the incremental wizard to be used instead.
  `,

  issues: [
    '`var args = seqspec.args;` on line 194 of `foam3/src/foam/util/async/Sequence.js` is undefined which causing the error in `LoadTopConfig.js` as no rootCapability provided. Somehow the context is lost.'
  ],

  imports: [
    'capabilityDAO',
    'crunchController',
    'wizardController?',
    'rootCapability'
  ],

  exports: [
    'rootCapability'
  ],

  requires: [
    'foam.u2.crunch.WizardRunner',
    'foam.u2.wizard.WizardType'
  ],

  methods: [
    async function execute(x) {
      const greetingWizard = this.rootCapability.greetingWizard;
      if ( greetingWizard ) {
        const capability = await this.capabilityDAO.find(greetingWizard);
        console.log(capability);
        // this.wizardController.wizardlets = [capability, ...this.wizardController.wizardlets];
        const wizardRunner = this.WizardRunner.create({
          wizardType: this.WizardType.UCJ,
          source: capability,
          options: {inline: false, returnCompletionPromise: true}
        }, this.__subContext__);
        let retPromise = await wizardRunner.launch();
        console.log(retPromise);
      }

      // launch first sequence with greeting stuff
      // and then launch main seq
      
     
    }
  ]
});
