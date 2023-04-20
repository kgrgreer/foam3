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
    'foam.mlang.predicate.True',
    'foam.core.Detachable'
  ],

  documentation: 'Create a Materialized View from a source DAO.',

  properties: [
    {
      class: 'Boolean',
      name: 'initialized'
    },
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
      javaType: 'foam.dao.MaterializedAdapter',
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
      class: 'Boolean',
      name: 'pm'
    },
    {
      documentation: 'Decorate with a ServiceProviderAwareDAO',
      name: 'serviceProviderAware',
      class: 'Boolean',
      javaFactory: 'return foam.nanos.auth.ServiceProviderAware.class.isAssignableFrom(getSourceDAO().getOf().getObjClass());'
    },
    {
      documentation: 'Enable authorization',
      class: 'Boolean',
      name: 'authorize',
      value: true
    },
    {
      class: 'Object',
      type: 'foam.nanos.auth.Authorizer',
      name: 'authorizer',
      javaFactory: `
      String sourceClass = getSourceDAO().getOf().getObjClass().getSimpleName().toLowerCase();
      if ( foam.nanos.auth.Authorizable.class.isAssignableFrom(getOf().getObjClass()) ) {
        return new foam.nanos.auth.AuthorizableAuthorizer(sourceClass);
      }
      return new foam.nanos.auth.StandardAuthorizer(sourceClass);
      `
    },
    {
      class: 'String',
      name: 'permissionPrefix',
      factory: function() {
        return this.of.name.toLowerCase();
      },
      javaFactory: `
      return getOf().getObjClass().getSimpleName().toLowerCase();
     `
    },
    {
      name: 'delegate',
      javaPreSet: `
        if ( getServiceProviderAware() ) {
          val = new foam.nanos.auth.ServiceProviderAwareDAO.Builder(getX())
            .setDelegate(val)
            .build();
        }

        if ( getAuthorize() ) {
          val = new foam.nanos.auth.AuthorizationDAO.Builder(getX())
            .setDelegate(val)
            .setAuthorizer(getAuthorizer())
            .build();
        }

        /* TODO: get suitable NSpec
        if ( getPm() )
          val = new foam.dao.PMDAO.Builder(getX()).setNSpec(getNSpec()).setDelegate(val).build();
        */
      `,
      javaFactory: 'return new foam.dao.MDAO(getOf());'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'observedDAOs',
      documentation: 'A list of DAOs that will be listened to',
      javaFactory: 'return getAdapter().getObservedDAOs();'
    }
  ],

  methods: [
    {
      name: 'maybeInit',
      javaType: 'void',
      // synchronized: true,
      javaCode: `
        if ( ! getInitialized() ) {
          setInitialized(true);
          AddIndexCommand cmd = new AddIndexCommand();

          cmd.setIndex(new MaterializedDAOIndex(this));

          getSourceDAO().cmd(cmd);

          String[] daoKeys = getObservedDAOs();
          if ( daoKeys.length != 0 ) {
            for ( String daoKey : daoKeys ) {
              DAO dao = (DAO) getX().get(daoKey);
              var self = this;
              if ( dao != null ) dao.listen(new AbstractSink() {
                public void put(Object obj, Detachable sub) {
                  getAdapter().onObservedDAOUpdate(self, daoKey, obj);
                }
              }, foam.mlang.MLang.TRUE);
            }
          }
      }
      `
    },
    {
      name: 'find_',
      javaCode: 'maybeInit(); return getDelegate().find_(x, id);'
    },
    {
      name: 'select_',
      javaCode: 'maybeInit(); return getDelegate().select_(x, sink, skip, limit, order, predicate);'
    },
    {
      name: 'adapt',
      args: 'FObject value',
      type: 'FObject',
      documentation: 'Template method for adapting from source to target model.',
      javaCode: 'return getAdapter().adapt(value);'
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
          getDelegate().remove(getAdapter().fastAdapt(value));
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
