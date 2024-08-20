/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'CapableWAO',
  implements: [ 'foam.u2.wizard.wao.WAO' ],
  flags: ['web'],

  imports: [
    'capable',
    'capabilityDAO',
    'crunchService'
  ],

  requires: [
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.ui.CapabilityWizardlet'
  ],

  methods: [
    async function save(wizardlet) {
      if ( wizardlet.loading ) return;
      if ( ! wizardlet.isAvailable ) return;
      wizardlet.loading = true;

      if ( wizardlet.status === this.CapabilityJunctionStatus.AVAILABLE ) {
        wizardlet.status = this.CapabilityJunctionStatus.ACTION_REQUIRED;
      }
      if ( ! this.capability )
        this.capability = await this.capabilityDAO.find(wizardlet.id);
      return this.capable.getCapablePayloadDAO().put(
        this.makePayload(wizardlet)
      ).then(payload => {
        if ( wizardlet.reloadAfterSave ) this.load_(wizardlet, payload);
        else wizardlet.loading = false;
        if ( wizardlet.isValid ) {
          wizardlet.status = this.CapabilityJunctionStatus.ACTION_REQUIRED;
        }
        return payload;
      });
    },
    async function cancel(wizardlet) {
      if ( ! wizardlet.isLoaded ) return;
      return this.capable.getCapablePayloadDAO().remove(
        this.makePayload(wizardlet)
      );
    },
    async function load(wizardlet) {
      if ( wizardlet.loading ) return;

      var targetPayload = await this.capable.getCapablePayloadDAO().find(wizardlet.id);

      // TODO: investigate nullWAO decorator not working on beforeWizardlet
      if ( wizardlet.data && ! targetPayload ){
        return;
      }

      await this.load_(wizardlet, targetPayload);
    },
    async function load_(wizardlet, payload) {
      wizardlet.isLoaded = true;

      wizardlet.status = this.CapabilityJunctionStatus.AVAILABLE;

      if ( payload ) wizardlet.status = payload.status;

      // No 'of'? No problem
      if ( ! wizardlet.of ) {
        wizardlet.loading = false;
        return;
      }

      // Load CapablePayload data to wizardlet
      var loadedData = wizardlet.of.create({}, wizardlet);
      if ( payload && payload.data )
        loadedData.copyFrom(payload.data);

      // Set transient 'capability' property if it exists
      var prop = wizardlet.of.getAxiomByName('capability');
      if ( prop ) prop.set(loadedData, wizardlet.capability);

      // Finally, apply new data to wizardlet
      if ( wizardlet.data ) {
        wizardlet.data.copyFrom(loadedData);
      } else {
        wizardlet.data = loadedData;
      }

      return foam.u2.wizard.Slot.blockFramed().then(() => {
        wizardlet.loading = false;
      });
    },
    function makePayload(wizardlet) {
      return this.CapabilityJunctionPayload.create({
        capability: wizardlet.capability,
        data: wizardlet.data
      });
    }
  ]
});
