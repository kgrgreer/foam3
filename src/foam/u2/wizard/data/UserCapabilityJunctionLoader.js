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
    'wizardlets',
    'crunchService',
    'subject',
    'wizardletId',
  ],

  requires: [
    'foam.u2.borders.LoadingLevel'
  ],

  methods: [
    async function load(data) {
      const wizardlet = await this.wizardlets.find(w => w.id === this.wizardletId);
      if ( wizardlet.loading ) return;
      wizardlet.loading = true;
      try {
        let ucj = this.subject ? await this.crunchService.getJunctionFor(
          null, wizardlet.capability.id, this.subject.user, this.subject.realUser
        ) : await this.crunchService.getJunction(
          null, wizardlet.capability.id
        );
        await this.load_(wizardlet, ucj, data);
      } catch (e) {
        console.log(e);
      } finally {
        wizardlet.loading = false;
      }
    },
    async function load_(wizardlet, ucj, data) {
      wizardlet.status = ucj.status;
      if ( ! wizardlet.of ) {
        wizardlet.loading = false;
        return;
      }
      // Load UCJ data to wizardlet
      var loadedData =  data ? data : wizardlet.of.create({}, wizardlet);
      if ( ucj.data ) loadedData.copyFrom(ucj.data);

      // Set transient 'capability' property if it exists
      // TODO: Get rid of support for this as soon as possible
      var prop = wizardlet.of.getAxiomByName('capability');
      if ( prop ) prop.set(loadedData, wizardlet.capability);

      // Finally, apply new data to wizardlet
      if ( wizardlet.data ) {
        wizardlet.data.copyFrom(loadedData);
      } else {
        wizardlet.data = loadedData.clone(wizardlet.__subSubContext__);
      }
    },
    function cancelSave_(w) {
      w.loadingLevel = this.LoadingLevel.IDLE;
      return Promise.resolve();
    }
  ]
});
