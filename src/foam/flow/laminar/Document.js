/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.laminar',
  name: 'Document',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.flow.AbstractDoclet',
      name: 'doclets'
    }
  ],

  methods: [
    async function runFrom (i) {
      let x = this.__subContext__;
      const doclets = this.doclets.slice(i);
      for ( const doclet of doclets ) {
        try {
          x = await doclet.execute(x);
        } catch (e) {
          console.log('error executing doclet', e);
        }
      }
    }
  ]
});
