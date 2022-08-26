/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'MaterializedDAO',
  extends: 'foam.dao.ReadOnlyDAO',

  javaImports: [
    'foam.core.FObject',
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
      name: 'predicate',
      javaValue: 'foam.mlang.MLang.TRUE'
    },
    {
      class: 'FObjectProperty',
      name: 'adapter',
      of: 'foam.mlang.F',
      javaFactory: 'return new CopyAdapter(getOf());'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'sourceDAO',
      required: true
    },
    {
      name: 'of',
      required: true
//      javaFactory: 'return getSourceDAO().getOf();'
    },
    {
      name: 'delegate',
      javaFactory: 'return new foam.dao.MDAO(getOf());'
    }
  ],

  methods: [
    {
      name: 'init_',
      javaCode: `
        AddIndexCommand cmd = new AddIndexCommand();

        cmd.setIndex(new MaterializedDAOIndex(this));

        getSourceDAO().cmd(cmd);
      `
    },

    {
      name: 'adapt',
      args: 'FObject value',
      type: 'FObject',
      documentation: 'Template method for adapting from source to target model.',
      javaCode: 'return (FObject) getAdapter().f(value);'
    },

    // Implement Index
    {
      name: 'indexPut',
      type: 'Object',
      args: 'Object state, FObject value',
      javaCode: `
        if ( getPredicate().f(value) ) {
          var obj = adapt(value);
          if ( obj != null )
            getDelegate().put(obj);
        }
        return this;
      `
    },

    {
      name: 'indexRemove',
      type: 'Object',
      args: 'Object state, FObject value',
      javaCode: `
        if ( getPredicate().f(value) ) {
          getDelegate().remove(adapt(value));
        }
        return this;
      `
    },

    {
      name: 'indexRemoveAll',
      type: 'Object',
      javaCode: `
        getDelegate().removeAll();
        return this;
      `
    }

  ]
});
