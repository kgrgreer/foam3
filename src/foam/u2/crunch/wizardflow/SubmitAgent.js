/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'SubmitAgent',
  flags: ['web'],
  documentation: `
    This agent is in charge of executing post-save submit logic.
  `,

  imports: [
    'wizardlets'
  ],

  methods: [
    async function execute() {
      for ( let w of this.wizardlets ) {
        if ( w.onSubmit ) await w.onSubmit();
      }
    }
  ]
});
