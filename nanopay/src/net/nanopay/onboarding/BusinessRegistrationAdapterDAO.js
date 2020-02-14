foam.CLASS({
  package: 'net.nanopay.onboarding',
  name: 'BusinessRegistrationAdapterDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Adapt businessRegistrationDAO.put to smeBusinessRegistrationDAO.put',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        BusinessRegistration ret = (BusinessRegistration) obj;

        DAO smeBusinessRegistrationDAO = (DAO) x.get("smeBusinessRegistrationDAO");
        DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
        User user = (User) smeBusinessRegistrationDAO.inX(x).put(adapt(x, ret));
        UserUserJunction junction = (UserUserJunction) agentJunctionDAO.find(
          EQ(UserUserJunction.SOURCE_ID, user.getId()));

        ret.setUserId(user.getId());
        if ( junction.findTargetId(x) instanceof Business ) {
          ret.setBusinessId(junction.getTargetId());
        }

        return super.put_(x, ret);
      `
    },
    {
      name: 'adapt',
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'businessRegistration',
          type: 'net.nanopay.onboarding.BusinessRegistration'
        }
      ],
      javaCode: `
        return new User.Builder(x)
          .setFirstName(businessRegistration.getFirstName())
          .setLastName(businessRegistration.getLastName())
          .setDesiredPassword(businessRegistration.getDesiredPassword())
          .setOrganization(businessRegistration.getOrganization())
          .setAddress(businessRegistration.getAddress())
          .build();
      `
    }
  ]
});
