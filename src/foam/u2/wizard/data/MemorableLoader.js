/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'MemorableLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  documentation: 'Uses route as obj id to fetch an instance, then load that',

  mixins: ['foam.u2.memento.Memorable'],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      name: 'route',
      memorable: true
    }
  ],

  methods: [
    async function load(o) {
      if ( this.delegate ) {
        const delegateResult = await this.delegate.load(o);
        if ( delegateResult ) {
          return delegateResult;
        }
      }

      return this.dao?.find(this.route);
    }
  ]
});
