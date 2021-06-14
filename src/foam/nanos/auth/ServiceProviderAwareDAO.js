/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `A DAO decorator which:
- enforces spid permissions on update and create,
- filters find, remove, and select by spids the caller has read permission on.
`,

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.app.AppConfig',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'java.util.stream.Collectors',
  ],

  properties: [
    {
      name: 'propertyInfo',
      class: 'Object',
      of: 'foam.core.PropertyInfo',
      javaFactory: `
      return (PropertyInfo) getOf().getAxiomByName("spid");
      `
    },
  ],

  methods: [
    {
      name: 'getPredicate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.mlang.predicate.Predicate',
      documentation: `
        Create a predicate used to restrict dao operations to objects whose spid the user is authorized to access
        via the permission "serviceprovider.read.<spid>".
      `,
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      ArrayList<ServiceProvider> serviceProviders = (ArrayList) ((ArraySink) ((DAO) getX().get("localServiceProviderDAO")).select(new ArraySink())).getArray();
      List<String> ids = serviceProviders.stream()
                            .map(ServiceProvider::getId)
                            .filter(id -> auth.check(x, "serviceprovider.read." + id))
                            .collect(Collectors.toList());
      if ( ids.size() == 1 ) {
        return MLang.EQ(getPropertyInfo(), ids.get(0));
      } else if ( ids.size() > 1 ) {
        return MLang.IN(getPropertyInfo(), ids.toArray(new String[0]));
      }
      throw new AuthorizationException();
      `
    },
    {
      name: 'getSpid',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String',
      javaThrows: ['AuthorizationException'],
      documentation: `
        Get the spid based on the current context by first trying to get subject.user.spid, and then
        theme.spid if there is no user.
        If no spid can be found, throw an AuthorizationException
        This is used in setting the spid when trying to put a new serviceProviderAware object that
        does not already have a spid set.
      `,
      javaCode: `
      User user = null;
      String spid = (String) x.get("spid");
      Subject subject = (Subject) x.get("subject");
      AuthService auth = (AuthService) x.get("auth");
      if ( subject != null ) {
        user = subject.getUser();
        if ( user != null ) {
          if ( ! SafetyUtil.isEmpty(user.getSpid()) ) {
             spid = user.getSpid();
          }
        }
      }
      if ( SafetyUtil.isEmpty(spid) ||
           user != null &&
           auth.check(x, "spid.default.theme") &&
           SafetyUtil.isEmpty(user.getSpid()) ) {
        Theme theme = ((Themes) x.get("themes")).findTheme(x);
        if ( theme != null &&
             ! SafetyUtil.isEmpty(theme.getSpid()) ) {
          spid = theme.getSpid();
        } else {
          ((foam.nanos.logger.Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "Theme not found", ( theme != null ? theme.getId()+":"+theme.getName() : "null"));
        }
      }
      if ( SafetyUtil.isEmpty(spid) ) {
        throw new AuthorizationException();
      }
      return spid;
      `
    },
    {
      name: 'put_',
      javaThrows: ['AuthorizationException'],
      documentation: `
        On put of a newly created object where the spid is not set, set context spid found via this.getSpid(x)
        Otherwise, restrict put to only objects for which the user has permission to via "serviceprovider.read.<spid>"

        Furthermore, if updating the spid property of an object, user must have the permissions
          "serviceprovider.update.<oldSpid>", as well as
          "serviceprovider.update.<spid>"
        where the serviceprovider update permission currently belongs only to admin.
      `,
      javaCode: `
      if ( ! ( obj instanceof ServiceProviderAware ) ) {
        return super.put_(x, obj);
      }
      Object id = obj.getProperty("id");
      FObject oldObj = getDelegate().inX(x).find(id);
      boolean isCreate = id == null || oldObj == null;
      ServiceProviderAware sp = (ServiceProviderAware) obj;
      ServiceProviderAware oldSp = (ServiceProviderAware) oldObj;
      AuthService auth = (AuthService) x.get("auth");
      if ( isCreate ) {
        if ( SafetyUtil.isEmpty(sp.getSpid()) ) {
          sp.setSpid(getSpid(x));
        } else if ( ! auth.check(x, "serviceprovider.read." + sp.getSpid()) ) {
          throw new AuthorizationException();
        }
      } else if ( ! sp.getSpid().equals(oldSp.getSpid()) &&
                  ! (auth.check(x, "serviceprovider.update." + oldSp.getSpid()) &&
                     auth.check(x, "serviceprovider.update." + sp.getSpid())) ) {
        throw new AuthorizationException();
      } else if ( sp.getSpid().equals(oldSp.getSpid()) &&
                  ! auth.check(x, "serviceprovider.read." + sp.getSpid()) ) {
        throw new AuthorizationException();
      }
      return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      documentation: `
        Add an additional predicate to find based on the context given:
          - If there is a user in the context, only allow users to find object for which they have permission to via "serviceprovider.read.<spid>"
          - Otherwise, restrict find based on the getUnauthenticatedPredicate(x)

        Alternatively, if user exists and has the global read permission "serviceprovider.read.*" for ServiceProvider,
        they are also authorized to read any object associated to the serviceproviders.
      `,
      javaCode: `
      if ( ((AuthService) x.get("auth")).check(x, "serviceprovider.read.*") ) {
        return getDelegate().find_(x, id);
      }

      Predicate spidPredicate = null;
      try {
        spidPredicate = getPredicate(x);
      } catch ( AuthorizationException e ) {
        Subject subject = (Subject) x.get("subject");
        if ( ( subject == null || subject.getRealUser() == null ) ) {
          spidPredicate = getUnauthenticatedPredicate(x);
        } else {
          throw e;
        }
      }
      return getDelegate().where(spidPredicate).find_(x, id);
      `
    },
    {
      name: 'remove_',
      documentation: `
        Allow users to remove objects for which they have permission to via "serviceprovider.read.<spid>".

        Alternatively, if user has the global remove permission "serviceprovider.remove.*" for ServiceProvider or permission to remove the ServiceProvider eg. "serviceprovider.remove.<spid>",
        they are also authorized to remove any object associated to the serviceproviders.
        This permission is currently only granted to admin.
      `,
      javaCode: `
      if ( ((AuthService) x.get("auth")).check(x, "serviceprovider.remove.*") ||
           getPredicate(x).f(obj) ) {
        return getDelegate().remove_(x, obj);
      }
      throw new AuthorizationException();
      `
    },
    {
      name: 'select_',
      documentation: `
        Add an additional predicate to select based on the context given:
          - If there is a user in the context, restrict select to return only the objects for which they have permission to 
          via "serviceprovider.read.<spid>
          - Otherwise, restrict select based on the getUnauthenticatedPredicate(x)
      `,
      javaCode: `
      Predicate spidPredicate = predicate;
      if ( ! ((AuthService) x.get("auth")).check(x, "serviceprovider.read.*") ) {
        try {
          spidPredicate = getPredicate(x);
        } catch ( AuthorizationException e ) {
          // NOTE: On Login, context is empty of subject and spid
          Subject subject = (Subject) x.get("subject");
          if ( ( subject == null || subject.getRealUser() == null ) ) {
            spidPredicate = getUnauthenticatedPredicate(x);
          } else {
            throw e;
          }
        }
        if ( predicate != null &&
             spidPredicate != null ) {
          spidPredicate = MLang.AND(
            spidPredicate,
            predicate
          );
        } else if ( spidPredicate == null ) {
          spidPredicate = predicate;
        }
      }
      return getDelegate().select_(x, sink, skip, limit, order, spidPredicate);
      `
    },
    {
      name: 'getUnauthenticatedPredicate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.mlang.predicate.Predicate',
      documentation: `
        Returns a predicate to restrict access to only the context spid, or return null if there is none, as is the case with login
      `,
      javaCode: `
        if ( x.get("spid") != null ) {
          ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "getUnauthenticatedPredicate", "spid restrictions set to context spid.");
          return MLang.EQ(getPropertyInfo(), x.get("spid"));
        }
        ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "getUnauthenticatedPredicate", "spid restrictions disabled.");
        return null;
      `
    }
  ]
});
