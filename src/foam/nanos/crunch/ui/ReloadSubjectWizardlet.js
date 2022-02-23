/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'ReloadSubjectWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',
  documentation: `
    an extension of the capabilitywizardlet which updates the subject from the server
    after the ucj is submitted
  `,

  imports: [ 'auth', 'subject' ],

  methods: [
    async function onSubmit() {
      this.subject = await this.auth.getCurrentSubject();
    }
  ]
});
