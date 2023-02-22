/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'UserCapabilityJunctionLoader',
  implements: [ 'foam.u2.wizard.data.Loader' ],

  documentation: `
    Will load ucj data into wizardlet.
  `,

  imports: [
    'crunchService',
    'subject',
    'wizardletId',
    'wizardlets'
  ],

  methods: [
    async function load({ old }) {
      const wizardlet = await this.wizardlets.find(w => w.id === this.wizardletId);
      try {
        let ucj = this.subject ? await this.crunchService.getJunctionFor(
          null, wizardlet.capability.id, this.subject.user, this.subject.realUser
        ) : await this.crunchService.getJunction(
          null, wizardlet.capability.id
        );
        wizardlet.status = ucj.status;
        // Load UCJ data to wizardlet
        var loadedData =  old ? old : wizardlet.of.create({}, wizardlet);
        if ( ucj.data ) loadedData.copyFrom(ucj.data);

        // Finally, apply new data to wizardlet
        if ( wizardlet.data ) {
          return old.copyFrom(loadedData);
        } else {
          return loadedData.clone(wizardlet.__subSubContext__);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  ]
});
