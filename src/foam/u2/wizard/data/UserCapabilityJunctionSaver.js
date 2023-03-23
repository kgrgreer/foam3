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
      class: 'String',
      name: 'capabilityId',
//      expression: function(importedWizardletId) {
//        return importedWizardletId;
//      }
    }
  ],


  methods: [
    async function save(data) {
    console.log('before---------- '+this.capabilityId);
      const ucj = await ( this.subject ? this.crunchService.updateJunctionFor(
        null, this.capabilityId, data, null,
        this.subject.user, this.subject.realUser
      ) : this.crunchService.updateJunction(null,
        this.capabilityId, data, null
      ));
      console.log('after ---------- '+this.capabilityId);
      await this.delegate.save(data);
    }
  ]
});
