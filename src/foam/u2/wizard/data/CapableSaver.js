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
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.u2.wizard.data.NullLoader',
    'foam.u2.wizard.data.ProxyLoader'
  ],

  properties: [
    {
      name: 'capability'
    },
    {
      name:'loader',
      class: 'foam.util.FObjectSpec'
    }
  ],

  methods: [
    async function save(data) {
      const loader = foam.json.parse(this.loader, undefined, this.__subContext__);
      foam.u2.wizard.data.ensureTerminal(loader, this.ProxyLoader, this.NullLoader);
      const root = await loader?.load({}) ?? this.capable;
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
