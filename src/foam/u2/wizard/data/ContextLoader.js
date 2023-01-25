/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'ContextLoader',
  implements: ['foam.u2.wizard.data.Loader'],

  properties: [
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'path'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      documentation: `
        OPTIONAL: For loading into the CapabilityJunction's data using a path
      `,
      name: 'loadIntoPath'
    },
    {
      name: 'of',
      class: 'Class'
    }
  ],

  methods: [
    async function load({ old }) {
      const val = this.path.f(this.__subContext__);

      if ( this.loadIntoPath ) {
        let initialData = this.delegate ? await this.delegate.load({ old }) : old;

        if ( ! initialData ) {
          initialData = this.of.create({}, this);
        }

        this.loadIntoPath$set(initialData, val);

        return initialData;
      }

      return val;
    }
  ]
});
