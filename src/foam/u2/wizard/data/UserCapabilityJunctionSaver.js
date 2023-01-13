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
    'wizardlets'
  ],

  properties: [
    {
      name: 'wizardletId',
      factory: function() {
        return this.importedWizardletId;
      }
    }
  ],


  methods: [
    async function save(data) {
      const wizardlet = await this.wizardlets.find(w => w.id === this.wizardletId);
      let p = this.subject ? this.crunchService.updateJunctionFor(
        null, this.wizardletId, data, null,
        this.subject.user, this.subject.realUser
      ) : this.crunchService.updateJunction(null,
        this.wizardletId, data, null
      );
      await p.then(ucj => {
        wizardlet.status = ucj.status;
      }).catch(e => console.debug(e) );
      await this.delegate.save(data);
    }
  ]
});
