foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'LogoutDisabledBusinessAgentsDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DAO decorator that logout agents when business is disabled.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.AuthService',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.util.List',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if (obj instanceof Business) {
          Business business = (Business) obj;
          Business oldBusiness = (Business) getDelegate().find(business.getId());
          if (
            oldBusiness != null
            && SafetyUtil.equals(business.getStatus(), AccountStatus.DISABLED)
            && ! SafetyUtil.equals(oldBusiness.getStatus(), AccountStatus.DISABLED)
          ) {
            DAO sessionDAO = (DAO) x.get("sessionDAO");
            AuthService auth = (AuthService) x.get("auth");

            ArraySink sink = (ArraySink) sessionDAO.where(
              MLang.EQ(
                Session.USER_ID, business.getId()))
              .select(new ArraySink());
            List<Session> sessions = sink.getArray();
            sessions.forEach((session) -> { auth.logout(session.getContext()); });
          }
        }

        return super.put_(x, obj);
      `
    }
  ]
});
