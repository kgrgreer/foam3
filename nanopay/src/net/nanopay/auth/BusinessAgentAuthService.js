foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'BusinessAgentAuthService',
  extends: 'net.nanopay.auth.ProxyAgentAuthService',

  documentation: 'Allows users to act as businesses and regular users.',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'agentJunctionDAO',
    'bareUserDAO',
    'groupDAO'
    ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.NanoService',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',

    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.AgentJunctionStatus',
    'net.nanopay.contacts.Contact',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.NOT'
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        if ( getDelegate() instanceof NanoService ) {
          ((NanoService) getDelegate()).start();
        }
      `
    },
    {
      name: 'actAs',
      // NOTE: This service extends ProxyAgentAuthService which implements
      // the AgentAuthService interface. The arguments list and return type can
      // be found in the AgentAuthService interface declaration.
      javaCode: `
        if ( entity == null ) {
          throw new AuthorizationException("Entity user doesn't exist.");
        } else if ( entity instanceof Contact ) {
          throw new RuntimeException("You cannot act as a contact.");
        }

        Subject subject = (Subject) x.get("subject");
        User effectiveUser = subject.getEffectiveUser();

        // Make sure you're logged in as yourself before trying to act as
        // someone else.
        if ( effectiveUser == null ) {
          throw new AuthenticationException();
        }

        if ( ! canActAs(x, effectiveUser, entity) ) {
          return null;
        }

        UserUserJunction permissionJunction = (UserUserJunction) ((DAO) getAgentJunctionDAO()).find(AND(
          EQ(UserUserJunction.SOURCE_ID, effectiveUser.getId()),
          EQ(UserUserJunction.TARGET_ID, entity.getId())
        ));
        Group actingWithinGroup = (Group) ((DAO) getGroupDAO()).find(permissionJunction.getGroup());

        // Clone and freeze both user and agent.
        entity = (User) entity.fclone();
        entity.freeze();
        effectiveUser = (User) effectiveUser.fclone();
        effectiveUser.freeze();

        Subject sessionSubject = new Subject.Builder(x).setUser(entity).setEffectiveUser(effectiveUser).build();

        // Set user and agent objects into the session context and place into sessionDAO.
        Session session = x.get(Session.class);
        session.setUserId(entity.getId());
        session.setAgentId(effectiveUser.getId());
        session.setContext(session.getContext().put("subject", sessionSubject));
        session.setContext(session.getContext().put("group", actingWithinGroup));
        DAO sessionDAO = (DAO) getX().get("localSessionDAO");
        sessionDAO.put(session);
        return effectiveUser;
      `
    },
    {
      name: 'canActAs',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'agent',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'entity',
          type: 'foam.nanos.auth.User',
        }
      ],
      javaCode: `
      try {
        // check entity status is not disabled
        if ( AccountStatus.DISABLED == entity.getStatus() ) {
          throw new AuthorizationException("Entity is disabled.");
        }

        DAO groupDAO = (DAO) x.get("groupDAO");
        Group group = (Group) groupDAO.inX(x).find(entity.getGroup());
        if ( group == null ) {
          throw new AuthorizationException("Entity must exist within a group.");
        } else if ( ! group.getEnabled() ) {
          throw new AuthorizationException("Entity's group must be enabled.");
        }

        // Finds the UserUserJunction object to see if user can act as the
        // passed in user. Source (agent) users are permitted to act as
        // target (entity) users, not vice versa.
        DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");

        // Use the system context here instead of the user context in case the
        // user doesn't have permission to read the status property, in which
        // case it defaults to Active and passes.
        UserUserJunction permissionJunction = (UserUserJunction) agentJunctionDAO.find(AND(
          EQ(UserUserJunction.TARGET_ID, entity.getId())
        ));

        if ( permissionJunction == null ) {
          throw new AuthorizationException("You don't have access to act as the requested entity.");
        }

        // Junction object contains a group which has a unique set of
        // permissions specific to the relationship.
        Group actingWithinGroup = (Group) groupDAO.find(permissionJunction.getGroup());
        if ( actingWithinGroup == null || ! actingWithinGroup.getEnabled() ) {
          throw new AuthorizationException("No permissions are appended to the entity relationship.");
        }

        // Permit access to agent with active junctions.
        if ( permissionJunction.getStatus() != AgentJunctionStatus.ACTIVE ) {
          throw new AuthorizationException("Junction currently disabled, unable to act as user.");
        }

        return true;
      } catch (Throwable t) {
        Logger logger = (Logger) x.get("logger");
        logger.error("Unable to act as entity: ", t);
        return false;
      }
      `
    }
  ]
});

