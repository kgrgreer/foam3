/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.test',
  name: 'ServiceProviderAuthorizerTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'foam.nanos.auth.ServiceProvider'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        DAO serviceProviderDAO = (DAO) x.get("serviceProviderDAO");
        ServiceProvider serviceProvider = new ServiceProvider.Builder(x).setId("testspid").build();
        boolean threw;

        threw = false;
        try {
          serviceProvider = (ServiceProvider) serviceProviderDAO.inX(x).put(serviceProvider);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Admin user can add serviceProvider");

        threw = false;
        try {
           serviceProviderDAO.inX(x).find(serviceProvider);
        } catch ( AuthorizationException e ) {
           threw = true;
        }
        test(! threw, "Admin user can view serviceProvider");

        threw = false;
        try {
          serviceProviderDAO.inX(x).put(serviceProvider);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Admin user can update serviceProvider");

        threw = false;
        try {
          serviceProviderDAO.inX(x).remove(serviceProvider);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Admin user can remove serviceProvider");

        serviceProvider = (ServiceProvider) serviceProviderDAO.inX(x).put(serviceProvider);


        User nonAdminUser = new User();
        nonAdminUser.setSpid(serviceProvider.getId());
        nonAdminUser.setEmail("nonadmin@nanopay.net");
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        nonAdminUser = (User) localUserDAO.put(nonAdminUser);

        Session nonAdminUserSession = new Session.Builder(x)
          .setUserId(nonAdminUser.getId())
          .build();
        X nonAdminUserContext = nonAdminUserSession.applyTo(x);

        threw = false;
        try {
          serviceProviderDAO.inX(nonAdminUserContext).put(serviceProvider);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(threw, "Non admin user can't add serviceProvider");

        threw = false;
        try {
          serviceProviderDAO.inX(nonAdminUserContext).find(serviceProvider);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(! threw, "Non admin user can view serviceProvider they have");

        threw = false;
        ServiceProvider otherSpid = null;
        try {
          otherSpid = (ServiceProvider) serviceProviderDAO.inX(nonAdminUserContext).find("nanopay");
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(threw || otherSpid == null, "Non admin user cannot view serviceProvider they don't have");

        threw = false;
        try {
          serviceProviderDAO.inX(nonAdminUserContext).put(serviceProvider);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(threw, "Non admin user can't update serviceProvider");

        threw = false;
        try {
          serviceProviderDAO.inX(nonAdminUserContext).remove(serviceProvider);
        } catch ( AuthorizationException e ) {
          threw = true;
        }
        test(threw, "Non admin user can't remove serviceProvider");

        serviceProviderDAO.inX(x).remove(serviceProvider);
      `
    }
  ]
})
