/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO:
//   Create CopyAdapter
//   Let MDAO AddIndexCommand take Indices directly

foam.CLASS({
  package: 'foam.dao',
  name: 'MaterializedDAO',
  extends: 'foam.dao.ReadOnlyDAO',

  javaImports: [
    'foam.dao.index.AddIndexCommand',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.predicate.True'
  ],

  documentation: 'Create a Materialized View from a source DAO.',

  properties: [
    {
      class: 'Object',
      javaType: 'foam.mlang.predicate.Predicate',
      generateJava: true,
//      class: 'foam.mlang.ExprProperty',
      name: 'predicate',
      javaValue: 'foam.mlang.MLang.TRUE'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'adapter',
      java:true,
      // TODO: default to a CopyAdapter
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'sourceDAO'
    },
    {
      name: 'of',
      javaFactory: 'return getSourceDAO().getOf();'
    },
    {
      name: 'delegate',
      javaFactory: 'return new foam.dao.MDAO(getOf());'
    }
  ],

  methods: [
    {
      name: 'init',
      javaCode: `
        AddIndexCommand cmd = new AddIndexCommand();

        cmd.setIndex(new MaterializedDAOIndex(this));

        getSourceDAO().cmd(cmd);
      `
    },

    // Implement Index
    {
      name: 'indexPut',
      type: 'Object',
      args: 'Object state, FObject value',
      synchronized: true,
      javaCode: `
        if ( getPredicate().f(value) ) {
          getDelegate().put((foam.core.FObject)(getAdapter().f(value)));
        }
        return this;
      `
    },

    {
      name: 'indexRemove',
      type: 'Object',
      args: 'Object state, FObject value',
      synchronized: true,
      javaCode: `
        getDelegate().remove((foam.core.FObject)(getAdapter().f(value)));
        return this;
      `
    },

    {
      name: 'indexRemoveAll',
      type: 'Object',
      synchronized: true,
      javaCode: `
        getDelegate().removeAll();
        return this;
      `
    },

  ]
});
