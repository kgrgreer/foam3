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
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'savers',
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
      if ( ! this.savers[this.savers.length-1].delegate )
        this.savers[this.savers.length-1].delegate = this.delegate;
      return await this.savers[0].save(data);
    }
  ]
});
