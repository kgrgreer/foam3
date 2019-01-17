foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'NanopayLogoutDisabledUserDAO',
  extends: 'foam.nanos.auth.LogoutDisabledUserDAO',

  documentation: `DAO decorator which logout user who is being disabled by setting enabled=false or status=DISABLED.`,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.admin.model.AccountStatus',
  ],

  methods: [
    {
      name: 'isDisabled',
      javaCode: `
        return ! user.getEnabled()
          || SafetyUtil.equals(user.getStatus(), AccountStatus.DISABLED);
      `
    }
  ]
});
