foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'SigningOfficerAssignedIpHistoryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for capturing user IP address when
      assigning user as signing officer.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'javax.servlet.http.HttpServletRequest',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());

        if (
          oldUser != null
          && !oldUser.getSigningOfficer()
          && newUser.getSigningOfficer()
        ) {
          HttpServletRequest request = x.get(HttpServletRequest.class);
          String ipAddress = request.getRemoteAddr();
          String description = "Signing officer assigned";

          IpHistory record = new IpHistory.Builder(x)
            .setUser(newUser.getId())
            .setIpAddress(ipAddress)
            .setDescription(description).build();
          ((DAO) x.get("ipHistoryDAO")).put(record);
        }

        return super.put_(x, obj);
      `
    }
  ]
});
