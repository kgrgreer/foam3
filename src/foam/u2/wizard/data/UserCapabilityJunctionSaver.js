/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'UserCapabilityJunctionSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  documentation: `
    Will save ucj data from wizardlets
  `,

  imports: [
    'crunchService',
    'subject',
    'wizardletId as importedWizardletId',
    'wizardlets',
    'wizardSubject?'
  ],

  properties: [
    {
      class: 'String',
      name: 'capabilityId'
    }
  ],


  methods: [
    async function save(data) {
      const ucj = await ( this.wizardSubject ? this.crunchService.updateJunctionFor(
        null, this.capabilityId, data, null,
        this.wizardSubject.user, this.wizardSubject.realUser
      ) : this.crunchService.updateJunction(null,
        this.capabilityId, data, null
      ));
      console.log('after ---------- '+this.capabilityId, x.subject.user.id);
      await this.delegate.save(data);
    }
  ]
});
