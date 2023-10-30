/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CapabilityAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: `
  This decorator checks for either a capability or permission string. If the check returns false, delegate to next authservice. Return true otherwise.
  `,

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.LimitedSink',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.CapabilityAuthServicePredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.AssociatedEntity',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityIntercept',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.nanos.session.Session',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.Date',
    'java.util.List',
    'java.util.Map',
    'javax.security.auth.AuthPermission',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'capabilityPermissions',
      documentation: `All permissions granted by any Capability. Used to
      short-circuit permission checks for permissions that can't possibly be
      granted by any UCJ.`,
      class: 'Map',
      javaFactory: `
        // There is no ConcurrentHashSet, which is why we need to use a Map.
        Map  m    = new ConcurrentHashMap<String, AuthPermission>();
        Sink sink = new AbstractSink() {
          public void put(Object obj, Detachable sub) {
            Capability c = (Capability) obj;
            for ( var j = 0 ; j < c.getPermissionsGranted().length ; j++ ) {
              String p = c.getPermissionsGranted()[j];
              m.put(p, new AuthPermission(p));
            }
          }
        };

        DAO d1 = (DAO) getX().get("localCapabilityDAO");

        d1.select(sink);

        d1.listen(sink, foam.mlang.MLang.TRUE);

        return m;
      `
    }
  ],

  methods: [
    {
      name: 'isMatch',
      type: 'Boolean',
      args: 'String p',
      javaCode: `
        if ( p.startsWith("serviceprovider") ) return true;

        java.security.Permission p2 = new AuthPermission(p);

        for ( Object perm : getCapabilityPermissions().values() )
          if ( ((AuthPermission) perm).implies(p2) ) return true;

        return false;
      `
    },
    {
      name: 'check',
      documentation: `
      Check if the given input string is in the userCapabilityJunctions or implied by a capability in userCapabilityJunctions for the current context user
      `,
      javaCode: `
        PM pm = PM.create(getX(), this.getClass(), "check");
        try {
          User user = ((Subject) x.get("subject")).getUser();

          if ( getDelegate().check(x, permission) ) return true;

          if ( ! isMatch(permission) ) return false;

          return user == null ?
            checkSpid_(x, (String) x.get("spid"), permission) :
            capabilityCheck(x, user, permission) || checkSpid_(x, user.getSpid(), permission) ;
        } finally {
          pm.log(getX());
        }
      `
    },
    {
      name: 'checkUser',
      javaCode: `
      PM pm = PM.create(getX(), this.getClass(), "checkUser");
      try {
        if ( getDelegate().checkUser(x, user, permission) ) return true;

        if ( ! isMatch(permission) ) return false;

        return user == null ?
          checkSpid_(x, (String) x.get("spid"), permission) :
          capabilityCheck(x, user, permission) || checkSpid_(x, user.getSpid(), permission) ;
     } finally {
        pm.log(getX());
      }
      `
    },
    {
      name: 'checkSpid_',
      args: 'Context x, String spid, String permission',
      type: 'Boolean',
      documentation: `
        When there is no user in the context, try to check if the permission is granted by the context spid
      `,
      javaCode: `
        if ( ! foam.util.SafetyUtil.isEmpty(spid) ) {
          DAO localSpidDAO = (DAO) x.get("localServiceProviderDAO");
          ServiceProvider sp = (ServiceProvider) localSpidDAO.find(spid);
          if ( sp == null ) return false;
          // service provider needs system context (getX())
          // to bypass auth call in prerequisiteImplies
          sp.setX(getX());
          return sp.grantsPermission(x, permission);
        }
        return false;
      `
    },
    {
      name: 'capabilityCheck',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'permission',
          type: 'String'
        }
      ],
      documentation: `
        Check if the given input string is in the userCapabilityJunctions or
        implied by a capability in userCapabilityJunctions for a given user.
      `,
      javaCode: `
        if ( x == null || permission == null ) return false;
        if ( x.get(Session.class) == null ) return false;
        if ( user == null || user.getLifecycleState() != foam.nanos.auth.LifecycleState.ACTIVE ) return false;

        User realUser = ((Subject) x.get("subject")).getRealUser();

        try {
          DAO capabilityDAO = ( x.get("localCapabilityDAO") == null ) ? (DAO) x.get("capabilityDAO") : (DAO) x.get("localCapabilityDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          // TODO: Is the first check required? If a UCJ doesn't have an EXPIRY, then would it ever be EXPIRED?
          Predicate capabilityScope = OR(
              NOT(HAS(UserCapabilityJunction.EXPIRY)),
              NOT(EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.EXPIRED))
          );
          CapabilityAuthServicePredicate predicate = new CapabilityAuthServicePredicate(getX(), capabilityDAO, permission, null);

          // Check if a ucj implies the subject.user(business) has this permission
          Predicate userPredicate = AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            NOT(INSTANCE_OF(AgentCapabilityJunction.class))
          );

          // if realuser and user is the same, we can check without specifying entity
          if ( realUser != null && realUser.getId() == user.getId() &&
              userCapabilityJunctionDAO.find(AND(userPredicate, capabilityScope, predicate)) != null ) {
            return true;
          }

          predicate.setEntity(AssociatedEntity.USER);
          if ( userCapabilityJunctionDAO.find(AND(userPredicate, capabilityScope, predicate)) != null ) {
            return true;
          }

          // Check if a ucj implies the subject.realUser has this permission
          if ( realUser != null && realUser.getId() != user.getId() && realUser.getSpid().equals(user.getSpid()) ) {
            userPredicate = AND(
              EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId()),
              NOT(INSTANCE_OF(AgentCapabilityJunction.class))
            );
            predicate.setEntity(AssociatedEntity.REAL_USER);
            if ( userCapabilityJunctionDAO.find(AND(userPredicate, capabilityScope, predicate)) != null ) {
              return true;
            }
          }

          // Check if a ucj implies the subject.realUser has this permission in relation to the user
          if ( realUser != null && realUser.getId() != user.getId() ) {
            userPredicate = AND(
              EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId()),
              EQ(AgentCapabilityJunction.EFFECTIVE_USER, user.getId()),
              INSTANCE_OF(AgentCapabilityJunction.class)
            );
            predicate.setEntity(AssociatedEntity.ACTING_USER);
            if ( userCapabilityJunctionDAO.find(AND(userPredicate, capabilityScope, predicate)) != null ) {
              return true;
            }
          }
        } catch ( Exception e ) {
          Logger logger = (Logger) x.get("logger");
          logger.error("capabilityCheck", permission, e);
        }

        maybeIntercept(x, permission);
        return false;
      `
    },
    {
      name: 'maybeIntercept',
      documentation: `
        This method might throw a CapabilityIntercept if a capability can intercept.
      `,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'permission',
          type: 'String'
        }
      ],
      javaCode: `
        DAO capabilityDAO = (DAO) getX().get("localCapabilityDAO");

        // Find intercepting capabilities
        List<Capability> capabilities =
          ( (ArraySink) capabilityDAO.where(IN(permission, Capability.PERMISSIONS_INTERCEPTED))
            .select(new ArraySink()) ).getArray();

        if ( capabilities.size() < 1 ) return;

        // Add filteredCapabilities to a runtime exception and throw it
        CapabilityIntercept ex = new CapabilityIntercept(
          "Permission [" + permission + "] denied. Filtered Capabilities available.");
        for ( Capability cap : capabilities ) {
          if ( cap.getInterceptIf().f(x) ) ex.addCapabilityId(cap.getId());
        }

        if ( ex.getCapabilities().length > 0 ) throw ex;
      `
    }
  ]
});
