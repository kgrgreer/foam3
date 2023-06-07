/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'CompositeWAO',
  extends: 'foam.u2.wizard.wao.ProxyWAO',
  flags: ['web'],
  documentation: 'Applies multiple WAOs to a wizardlet',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wao.WAO',
      name: 'delegates'
    }
  ],

  methods: [
    async function load(...args) {
      for ( const delegate of this.delegates ) await delegate.load(...args);
    },
    async function save(...args) {
      for ( const delegate of this.delegates ) await delegate.save(...args);
    },
    async function cancel(...args) {
      for ( const delegate of this.delegates ) await delegate.cancel(...args);
    },
    
    function clone(opt_X) {
      const o = this.SUPER(opt_X);
      for ( let i = 0 ; i < o.delegates.length ; i++ ) {
        o.delegates[i] = o.delegates[i].clone(opt_X);
      }
      return o;
    }
  ]
});
