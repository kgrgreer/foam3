/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'DAOArrayLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      factory: function () {
        return this.TRUE;
      }
    }
  ],

  methods: [
    async function load() {
      const sink = await this.dao.where(this.predicate).select();
      return sink.array;
    }
  ]
})
