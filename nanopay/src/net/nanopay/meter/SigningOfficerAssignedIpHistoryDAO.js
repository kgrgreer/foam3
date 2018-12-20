foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'SigningOfficerAssignedIpHistoryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for capturing user IP address when
      assigning user as signing officer.`,

  javaImports: [
    'foam.nanos.auth.User',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());

        if (
          oldUser != null
          && oldUser.getSigningOfficer() != newUser.getSigningOfficer()
        ) {
          IpHistoryService ipHistoryService = new IpHistoryService(x);
          String description = String.format("Signing officer: %s %s",
            newUser.getSigningOfficer() ? "assigned to" : "revoked from",
            newUser.getEmail());

          ipHistoryService.record(newUser, description);
        }

        return super.put_(x, obj);
      `
    }
  ]
});
