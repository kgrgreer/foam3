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

      // Copy list of requirements
      {
        const setOfRequirements = {};
        for ( const capable of [sourceCapable, targetCapable] ) {
          for ( const id of sourceCapable.capabilityIds ) {
            if ( this.requirementsExcludes.includes(id) ) continue;
            setOfRequirements[id] = true;
          }
        }

        const listOfRequirements = this.requirementsIncludes.length > 0
          ? this.requirementsIncludes.filter(v => setOfRequirements[v])
          : Object.keys(setOfRequirements);

        targetCapable.capabilityIds = Object.keys(setOfRequirements);
      }

      // Copy existing payloads
      {
        const sourceDAO = sourceCapable.getCapablePayloadDAO();
        const targetDAO = targetCapable.getCapablePayloadDAO();

        const sourcePayloads = (await sourceDAO.select()).array;
        for ( const payload of sourcePayloads ) {
          targetDAO.put(payload);
        }
      }

      return targetCapable;
    }
  ]
});
