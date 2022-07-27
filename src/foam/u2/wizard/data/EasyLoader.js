/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'EasyLoader',
  implements: ['foam.u2.wizard.data.Loader'],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'loaders',
      postSet: function (_, n) {
        if ( n.length < 2 ) return;
        debugger;
        for ( let i = 1 ; i < n.length ; i++ ) {
          n[i].delegate = n[i-1];
        }
      }
    }
  ],

  methods: [
    async function load({ old }) {
      return await this.loaders[this.loaders.length - 1].load(...arguments);
    }
  ]
});
