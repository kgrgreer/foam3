/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'PublicUserInfoDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Populate a model returned from find or select with a small subset of public
    user information.
    
    Example: A call like
      new foam.dao.PublicUserInfoDAO(x, "payerId", "payer", ...)
  
    will look for a property named "payerId" on the object being selected and
    look up the user associated with that id. It will then set the given property
    ("payer") to the object being returned that contains some public properties
    of the associated user.
    Requires both properties to already be defined on the model. For example, on
    Transaction.js:
        ...
      },
      {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payer',
      storageTransient: true
      },
      {
      class: 'Long',
      name: 'payerId'
      },
      {
        ...
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'String',
      name: 'idProperty',
      documentation: 'A property of the model that the DAO is \'of\' that holds the id of a user'
    },
    {
      class: 'String',
      name: 'userProperty',
      documentation: `
        A property of the model that the DAO is 'of' that will be replaced with the
        public user info of the user identified by 'idProperty'
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'userDAO',
      documentation: 'A DAO to store user instances'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PublicUserInfoDAO(
            X x,
            String idProperty,
            String userProperty,
            DAO delegate
          ) {
            this(x, true, idProperty, userProperty, delegate);
          }
        
          public PublicUserInfoDAO(      
            X x,
            boolean integrityCheck,
            String idProperty,
            String userProperty,
            DAO delegate
          ) {
            super(x, delegate);
            setIdProperty(idProperty);
            setUserProperty(userProperty);
            setUserDAO((DAO) x.get("bareUserDAO"));
        
            if ( integrityCheck ) {
              // Check if the given properties exist on the model.
              foam.core.ClassInfo classInfo = delegate.getOf();
        
              if ( classInfo.getAxiomByName(idProperty) == null ) {
                throw new IllegalArgumentException("Property '" + idProperty + "' does not exist on model '" + classInfo.getId() + "'.");
              } else if ( classInfo.getAxiomByName(userProperty) == null ) {
                throw new IllegalArgumentException("Property '" + userProperty + "' does not exist on model '" + classInfo.getId() + "'.");
              } 
            }
          }

          /** Used to apply the replacement logic to each item returned by a select */
          protected class DecoratedSink extends foam.dao.ProxySink {
            public DecoratedSink(X x, Sink delegate) {
              super(x, delegate);
            }

            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              obj = fillPublicInfo((FObject) obj);
              getDelegate().put(obj, sub);
            }
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        obj = fillPublicInfo(obj);
        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);
        if ( obj != null ) {
          obj = fillPublicInfo(obj);
        }
        return obj;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink decoratedSink = new DecoratedSink(x, sink);
        getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
        return sink;
      `
    },
    {
      name: 'fillPublicInfo',
      visibility: 'protected',
      type: 'FObject',
      args: [
        { type: 'FObject', name: 'obj' }
      ],
      documentation: `
        Given an object in the DAO, replace one property on that object with some
        public properties of a user whose id is specified by another property on
        the object. Both the user property to be replaced and the property holding
        the id of the user whose info is to be looked up are stored in the class
        and have been passed into the constructor.
      `,
      javaCode: `
        FObject clone = obj.fclone();
        long id = (long) clone.getProperty(getIdProperty());
        User user = (User) getUserDAO().find(id);

        if ( user == null ) {
          clone.setProperty(getUserProperty(), null);
        } else {
          PublicUserInfo entity = new PublicUserInfo(user);
          clone.setProperty(getUserProperty(), entity);
        }

        return clone;
      `
    }
  ]
});

