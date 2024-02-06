/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'MaterializedDAO',
  extends: 'foam.dao.ReadOnlyDAO',

  constants: [
    { type: 'String', name: 'PUT',        value: 'PUT' },
    { type: 'String', name: 'REMOVE',     value: 'REMOVE' },
    { type: 'String', name: 'REMOVE_ALL', value: 'REMOVE_ALL' }
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.index.AddIndexCommand',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.predicate.True',
    'foam.core.Detachable'
  ],

  javaImplements: [ 'Runnable' ],

  documentation: `
    Create a Materialized View from a source DAO.

    Uses a dedicated daemon Thread to process updates (put, remove, removeAll)
    instead of handling immediately because the index updates happen under
    the MDAO writeLock_. Filtering and adapting objects can take a long time
    and we don't want to hold the lock while we're performing this work otherwise
    we would block the source day to updates.

    The queue property is used to communicate to the processing Thread.
    Object arrays of size 2 are used with the first element being the command,
    either PUT, REMOVE, or REMOVE_ALL and the second being the FObject being
    processed in the case of PUT and REMOVE.

    REMOVE_ALL clear()'s the queue to avoid unnecessary work.
  `,

  properties: [
{
      class: 'Object',
      name: 'queue',
      javaType: 'java.util.concurrent.BlockingQueue',
      javaFactory: 'return new java.util.concurrent.LinkedBlockingQueue();'
    },
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
      if ( foam.nanos.auth.Authorizable.class.isAssignableFrom(getSourceDAO().getOf().getObjClass()) ) {
        return new foam.nanos.auth.AuthorizableAuthorizer(getPermissionPrefix());
      }
      return new foam.nanos.auth.StandardAuthorizer(getPermissionPrefix());
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
      synchronized: true,
      javaCode: `
        if ( ! getInitialized() ) {
Thread t = new Thread(this);
          t.setName("MaterializedDAO Processor: " + getDelegate());
          t.setDaemon(true);
          t.start();

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
        try {
          getQueue().put(new Object[] { PUT, value });
          } catch (InterruptedException e) {
        }
        return this;
      `
    },

    {
      name: 'indexRemove',
      type: 'Object',
      args: 'Object state, FObject value',
      javaCode: `
        try {
          getQueue().put(new Object[] { REMOVE, value });
        } catch (InterruptedException e) {
        }
        return this;
      `
    },

    {
      name: 'indexRemoveAll',
      type: 'Object',
      javaCode: `
        getQueue().clear();
        try {
          getQueue().put(new Object[] { REMOVE_ALL });
        } catch (InterruptedException e) {
        }
        return this;
      `
    },

    {
      name: 'run',
      type: 'void',
      javaCode: `
        Object[] cmd;
        FObject  value;

        foam.core.XLocator.set(getX());

        while ( true ) {
          try {
            cmd = (Object[]) getQueue().take();

            if ( cmd[0] == PUT ) {
              value = (FObject) cmd[1];

              if ( getPredicate().f(value) ) {
                var obj = adapt(value);
                if ( obj != null )
                  getDelegate().put(obj);
              }
            } else if ( cmd[0] == REMOVE ) {
              value = (FObject) cmd[1];

              if ( getPredicate().f(value) ) {
                getDelegate().remove(getAdapter().fastAdapt(value));
              }
            } else /* removeAll */ {
              getDelegate().removeAll();
            }
          } catch (InterruptedException e) {}
        }
      `
    }

  ]
});
