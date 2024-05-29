/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'EasySaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  properties: [
    {
      class: 'foam.util.FObjectSpecArray',
      name: 'savers'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'savers_',
      transient: true,
      postSet: function(_, n) {
        if ( n.length < 2 ) return;
        for ( let i = 0; i < n.length - 1; i++ ) {
          if ( ! foam.u2.wizard.data.ProxySaver.isInstance(n[i]) )
            console.log('Savers inside EasySaver must extend ProxySaver');
          n[i].delegate = n[i+1];
        }
      }
    }
  ],

  methods: [
    async function save(data) {
      if ( ! this.savers_.length )
        this.buildSavers();
      if ( ! this.savers_[this.savers_.length-1].delegate )
        this.savers_[this.savers_.length-1].delegate = this.delegate;
      return await this.savers_[0].save(data);
    },
    function buildSavers() {
      let arr = [];
      this.savers.forEach(e => {
        let s = foam.json.parse(e, undefined, this.__subContext__);
        arr.push(s);
      });
      this.savers_ = arr;
    }
  ]
});
