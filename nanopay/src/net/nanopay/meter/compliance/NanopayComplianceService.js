foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'NanopayComplianceService',

  documentation: 'Implementation of Compliance Service used for validating user/business/account compliance',

  implements: [
    'net.nanopay.meter.compliance.ComplianceService'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.session.Session',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessUserJunction',
    'java.util.List',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      // Note that this cache is not invalidated in the case where the user's group hierarchy is changed
      // so if a group is updated to become a descendant of the 'sme' group then a restart of the service
      // is necessary in order for this change to be applied.
      class: 'Map',
      name: 'smeDescendantList',
      javaFactory: `return new java.util.HashMap<String, Boolean>();`
    }
  ],

  methods: [
    {
      name: 'checkUserCompliance',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        User cachedAgent = (User) x.get("cachedComplianceAgent");
        User agent = (cachedAgent != null) ? cachedAgent : (User) x.get("agent");
        if ( agent != null ) {
          // Set the cached agent if it hasn't been set already
          if ( cachedAgent == null ) {
            DAO userDao = (DAO) x.get("localUserDAO");
            if ( userDao != null ) {
              agent = (User) userDao.find(agent.getId());
              x.put("cachedComplianceAgent", agent);
            }
          }

          // Skip checking blacklist for non-sme users
          if ( ! isSmeDescendant(x, agent) ) return true;

          // Whether compliance is passed
          return ComplianceStatus.PASSED == agent.getCompliance();
        }

        User cachedUser = (User) x.get("cachedComplianceUser");
        User user = (cachedUser != null) ? cachedUser : (User) x.get("user");
        if ( user != null ) {
          // Set the cached User if it hasn't been set already
          if ( cachedUser == null ) {
            DAO userDao = (DAO) x.get("localUserDAO");
            if ( userDao != null ) { 
              user = (User) userDao.find(user.getId());
              x.put("cachedComplianceUser", user);
            }
          }

          // Skip checking blacklist for non-sme users
          if ( ! isSmeDescendant(x, user) ) return true;

          // Whether compliance is passed
          return ComplianceStatus.PASSED == user.getCompliance();
        }

        // By default user compliance is passed
        return true;
      `
    },
    {
      name: 'isSmeDescendant',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'User'
        }
      ],
      type: 'Boolean',
      javaCode: `
        if ( user == null || user.getGroup() == null ) return false;

        // Check for a cached value.
        Boolean isDescendant = (Boolean) getSmeDescendantList().get(user.getGroup());
        if ( isDescendant != null ) {
          return isDescendant;
        }

        // Use the local group dao to bypass any permission checks on group lookups
        DAO localGroupDao = (DAO) x.get("localGroupDAO");
        if ( localGroupDao == null ) return false;

        // Find the group
        Group group = (Group) localGroupDao.find(user.getGroup());
        if ( group == null ) return false;

        // Lookup and cache the value
        isDescendant = group.isDescendantOf("sme", localGroupDao);
        getSmeDescendantList().put(group.getId(), isDescendant);
        return isDescendant;
      `
    },
    {
      name: 'checkBusinessCompliance',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        Business cachedBusiness = (Business) x.get("cachedComplianceBusiness");
        User user = (cachedBusiness != null) ? cachedBusiness : (User) x.get("user");
        if ( user instanceof Business ) {
          if ( cachedBusiness == null && user != null ) {
            DAO businessDao = (DAO) x.get("localBusinessDAO");
            if ( businessDao != null ) {
              cachedBusiness = (Business) businessDao.find(user.getId());
              List<BusinessUserJunction> signingOfficers = ((ArraySink) cachedBusiness
                .getSigningOfficers(x).getJunctionDAO().where(
                  EQ(BusinessUserJunction.SOURCE_ID, cachedBusiness.getId()))
                .select(new ArraySink())).getArray();
              coalesceBusinessAndSigningOfficersCompliance(cachedBusiness, signingOfficers);
              x.put("cachedComplianceBusiness", cachedBusiness);
            }
          }
          return cachedBusiness != null && cachedBusiness.getCompliance() == ComplianceStatus.PASSED;
        }
        return true;
      `
    },
    {
      name: 'checkAccountCompliance',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        // return true for now until we design a way to retrieve the active account
        return true;
      `
    },
    {
      name: 'coalesceBusinessAndSigningOfficersCompliance',
      args: [
        {
          name: 'business',
          type: 'net.nanopay.model.Business'
        },
        {
          name: 'signingOfficers',
          type: 'List<BusinessUserJunction>'
        }
      ],
      javaCode: `
        if ( ! signingOfficers.isEmpty() ) {
          business.setCompliance(signingOfficers.get(0).getCompliance());
        }
      `
    }
  ]
});
