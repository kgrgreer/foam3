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
        for ( let i = 0 ; i < n.length - 1 ; i++ ) {
          if ( ! foam.u2.wizard.data.ProxyLoader.isInstance(n[i]) )
            console.warn('Loaders inside EasyLoader must extend ProxyLoader');
          n[i].delegate = n[i+1];
        }
      }
    }
  ],

  methods: [
    async function load({ old }) {
      if ( ! this.loaders[this.loaders.length-1].delegate )
        this.loaders[this.loaders.length-1].delegate = this.delegate;
      return await this.loaders[0].load(...arguments);
    }
  ]
});
