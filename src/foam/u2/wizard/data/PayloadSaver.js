/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'PayloadSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  requires: [
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  properties: [
    {
      class: 'String',
      name: 'capabilityId'
    },
    {
      class: 'FObjectProperty',
      name: 'capableLoader'
    }
  ],

  methods: [
    async function save(data) {
      const capable = await this.capableLoader.load();
      const dao = capable.getCapablePayloadDAO();
      const payload = this.CapabilityJunctionPayload.create({
        capability: this.capabilityId,
        data
      });

      if ( ! data.errors_ ) payload.status = this.CapabilityJunctionStatus.GRANTED;

      const newPayload = await dao.put(payload);

      // Delegate saver is optional
      if ( ! this.delegate ) return newPayload.data;

      if ( foam.flags.dev ) {
        console.error(
          'If you see this you are the first person using PayloadSaver as a ' +
          'saver tee. It may be worth asking someone if this is a good idea.'
        );
      }

      return await this.delegate.save();
    }
  ]
});
