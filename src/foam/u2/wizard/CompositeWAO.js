/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'CompositeWAO',
  extends: 'foam.u2.wizard.ProxyWAO',
  flags: ['web'],
  documentation: 'Applies multiple WAOs to a wizardlet',

  properties: [
    {
      class: 'FObjectArray',
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
    }
  ]
});
