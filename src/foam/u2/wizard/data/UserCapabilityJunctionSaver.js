/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'UserCapabilityJunctionSaver',
  implements: [ 'foam.u2.wizard.data.Saver' ],
  documentation: `
    todo
  `,

  imports: [
    'subject',
    'wizardlets',
    'crunchService',
    'wizardletId',
  ],

  requires: [
    'foam.u2.borders.LoadingLevel'
  ],
  properties: [
    // {
    //   class: 'String',
    //   name: 'wizardletId'
    // }
  ],
  methods: [
    async function save(data) {
      const wizardlet = await this.wizardlets.find(w => w.id === this.wizardletId);
      // if ( wizardlet.loading ) {
      //   return this.cancelSave_(wizardlet);
      // }
      if ( ! wizardlet.isAvailable ) return this.cancelSave_(wizardlet);
      await this.save_(wizardlet, data);
      return data;
    },
    function save_(wizardlet, wData) {
      wizardlet.loading = true;
      let p = this.subject ? this.crunchService.updateJunctionFor(
        null, wizardlet.capability.id, wData, null,
        this.subject.user, this.subject.realUser
      ) : this.crunchService.updateJunction(null,
        wizardlet.capability.id, wData, null
      );
      p = p.then(ucj => {
          wizardlet.status = ucj.status;
          return ucj;
        }).catch(e => console.log(e) )
        .finally(wizardlet.loading = false);
      return p;
    },
    function cancelSave_(w) {
      w.loadingLevel = this.LoadingLevel.IDLE;
      return Promise.resolve();
    }
  ]
});
