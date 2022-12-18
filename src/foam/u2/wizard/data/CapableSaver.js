/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'CapableSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  documentation: `
    The CapableSaver class has knowledge of a capable object from the context. It will save data
    to the capable object after importing it.
  `,

  imports: [
    'capable?'
  ],

  requires: [
    'foam.nanos.crunch.CapabilityJunctionPayload'
  ],

  properties: [
    {
      name: 'capability'
    },
    'loader'
  ],

  methods: [
    async function save(data) {
      const root = await this.loader?.load({}) ?? this.capable;
      let a = await root.getCapablePayloadDAO().put(
        this.makePayload(data)
      );
      await this.delegate.save(a);
    },

    function makePayload(data) {
      return this.CapabilityJunctionPayload.create({
        capability: this.capability,
        data: data
      });
    }
  ]
});
