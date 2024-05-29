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
      class: 'foam.util.FObjectSpecArray',
      name: 'loaders',
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'loaders_',
      transient: true,
      postSet: function(_, n) {
        if ( n.length < 2 ) return;
        for ( let i = 0; i < n.length - 1; i++ ) {
          if ( ! foam.u2.wizard.data.ProxySaver.isInstance(n[i]) )
            console.log('Loaders inside EasySaver must extend ProxySaver');
          n[i].delegate = n[i+1];
        }
      }
    }
  ],

  methods: [
    async function load({ old }) {
      if ( ! this.loaders_.length )
        this.buildLoaders();
      if ( ! this.loaders_[this.loaders_.length-1].delegate )
        this.loaders_[this.loaders_.length-1].delegate = this.delegate;
      return await this.loaders_[0].load(...arguments);
    },
    function buildLoaders() {
      let arr = [];
      this.loaders.forEach(e => {
        let s = foam.json.parse(e, undefined, this.__subContext__);
        arr.push(s);
      });
      this.loaders_ = arr;
    }
  ]
});
