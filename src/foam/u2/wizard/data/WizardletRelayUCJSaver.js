/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'WizardletRelayUCJSaver',
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
      class: 'String',
      name: 'wizardletId'
    }
  ],


  methods: [
    async function save(data) {
      let useId = this.wizardletId || this.importedWizardletId;
      const wizardlet = await this.wizardlets.find(w => w.id === useId);
      let useData = this.wizardletId ? wizardlet.data : data;
      let p = this.subject ? this.crunchService.updateJunctionFor(
        null, useId, useData, null,
        this.subject.user, this.subject.realUser
      ) : this.crunchService.updateJunction(null,
        useId, useData, null
      );
      await p.then(ucj => {
        wizardlet.status = ucj.status;
      }).catch(e => console.debug(e) );
      await this.delegate.save(data);
    }
  ]
});
