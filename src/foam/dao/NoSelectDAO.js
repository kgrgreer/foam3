/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'NoSelectDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Prevent select-ing on a DAO. The user of the decorated DAO must know
    the ID of the object they wish to obtain.
  `,

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.Expr'
  ],

  methods: [
    {
      name: 'select_',
      code: async function select_ (_, sink) {
        return sink;
      },
      javaCode: `
        return prepareSink(sink);
      `
    },
    {
      name: 'find_',
      code:  async function find_(id) {
        if ( this.Predicate.isInstance(id) || this.Expr.isInstance(id) ) {
          return null;
        }
        this.delegate.find_(id);
      },
      javaCode: `
        if ( id instanceof foam.mlang.predicate.Predicate ) {
          return null;
        }
        return getDelegate().find_(x, id);
      `
    }
  ]
});
