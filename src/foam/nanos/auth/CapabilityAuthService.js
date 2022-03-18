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
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.LimitedSink',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.predicate.CapabilityAuthServicePredicate',
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
    'java.util.Date',
    'java.util.List',
    'java.util.Map',
    'java.util.concurrent.ConcurrentHashMap',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'check',
      documentation: `
      Check if the given input string is in the userCapabilityJunctions or implied by a capability in userCapabilityJunctions for the current context user
      `,
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        PM pm = PM.create(getX(), this.getClass(), "check");
        try {
          return getDelegate().check(x, permission) || ( user != null && capabilityCheck(x, user, permission) ) || ( user == null ? checkSpid_(x, (String) x.get("spid"), permission) : checkSpid_(x, user.getSpid(), permission) );
        } finally {
          pm.log(getX());
        }
      `
    },
    {
      name: 'checkSpid_',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'spid', type: 'String' },
        { name: 'permission', type: 'String' }
      ],
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
          return sp.grantsPermission(permission);
        }
        return false;
      `
    },
    {
      name: 'checkUser',
      javaCode: `
        PM pm = PM.create(getX(), this.getClass(), "check");
        try {
          return getDelegate().checkUser(x, user, permission) || capabilityCheck(x, user, permission) || ( user == null ? checkSpid_(x, (String) x.get("spid"), permission) : checkSpid_(x, user.getSpid(), permission));
        } finally {
          pm.log(getX());
        }
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
        if ( user == null || ! user.getEnabled() ) return false;
        User realUser = ((Subject) x.get("subject")).getRealUser();

        try {
          DAO capabilityDAO = ( x.get("localCapabilityDAO") == null ) ? (DAO) x.get("capabilityDAO") : (DAO) x.get("localCapabilityDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          Predicate capabilityScope = OR(
              NOT(HAS(UserCapabilityJunction.EXPIRY)),
              NOT(EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.EXPIRED))
          );
          CapabilityAuthServicePredicate predicate = new CapabilityAuthServicePredicate(x, capabilityDAO, permission, null);

          // Check if a ucj implies the subject.user(business) has this permission
          Predicate userPredicate = AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            NOT(INSTANCE_OF(AgentCapabilityJunction.class))
          );
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
