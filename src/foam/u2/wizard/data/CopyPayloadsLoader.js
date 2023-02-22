/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'CopyPayloadsLoader',
  extends: 'foam.u2.wizard.data.ProxySaver',

  documentation: `
    This Loader copies payloads from the provided loader's result onto the
    object obtained by the delegate loader.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.crunch.CapabilityJunctionPayload'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'capableLoader'
    },
    {
      class: 'StringArray',
      name: 'requirementsIncludes'
    },
    {
      class: 'StringArray',
      name: 'requirementsExcludes'
    }
  ],

  methods: [
    async function load(...a) {
      const sourceCapable = await this.capableLoader.load({});
      const targetCapable = await this.delegate.load(...a);
      let   listOfRequirements = [];

      // Copy list of requirements
      {
        const setOfRequirements = {};
        for ( const capable of [sourceCapable, targetCapable] ) {
          for ( const id of sourceCapable.capabilityIds ) {
            if ( this.requirementsExcludes.includes(id) ) continue;
            setOfRequirements[id] = true;
          }
        }

        listOfRequirements = this.requirementsIncludes.length > 0
          ? this.requirementsIncludes.filter(v => setOfRequirements[v])
          : Object.keys(setOfRequirements);

        targetCapable.capabilityIds = listOfRequirements;
      }

      // Copy existing required payloads to the target
      if ( listOfRequirements.length > 0 ) {
        const sourceDAO = sourceCapable.getCapablePayloadDAO();
        const targetDAO = targetCapable.getCapablePayloadDAO();

        await sourceDAO
          .where(this.IN(this.CapabilityJunctionPayload.CAPABILITY, listOfRequirements))
          .select({
            put: function (payload) {
              targetDAO.put(payload)
            }
          });
      }

      return targetCapable;
    }
  ]
});
