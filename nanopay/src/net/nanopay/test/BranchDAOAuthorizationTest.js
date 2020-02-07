foam.CLASS({
  package: 'net.nanopay.test',
  name: 'BranchDAOAuthorizationTest',
  extends: 'foam.nanos.test.Test',
  documentation: `class to test BranchDAO security`,
  flags: ['java'],

  javaImports: [
    'foam.nanos.session.Session',
    'foam.nanos.auth.User',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'net.nanopay.model.Branch',
    'foam.core.X'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `

      User smeUser = new User();
      User adminUser = new User();
      User nonSmeUser = new User();
      Branch testBranch = new Branch();
      
      boolean threw;

      smeUser.setGroup("sme");
      adminUser.setGroup("admin");
      nonSmeUser.setGroup("");

      DAO branchDAO = (DAO) x.get("branchDAO");
      DAO bareUserDAO = (DAO) x.get("bareUserDAO");

      smeUser = (User) bareUserDAO.put(smeUser);
      nonSmeUser = (User) bareUserDAO.put(nonSmeUser);
      adminUser = (User) bareUserDAO.put(adminUser);

      Session smeUserSession = new Session.Builder(x)
        .setUserId(smeUser.getId())
        .build();

      X smeContext = smeUserSession.applyTo(x);

      testBranch.setId(11100111);
      testBranch.setBranchId("test");

      threw = false;
      try {
        branchDAO.inX(smeContext).put(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Sme user can add branch");

      threw = false;
      try {
        branchDAO.inX(smeContext).find(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Sme user can view branch");

      threw = true;
      try {
        branchDAO.inX(smeContext).put(testBranch);
      } catch ( AuthorizationException e ) {
        threw = false;
      }
      test(! threw, "Sme user can not update branch");

      threw = true;
      try {
        branchDAO.inX(smeContext).remove(testBranch);
      } catch ( AuthorizationException e ) {
        threw = false;
      }
      test(! threw, "Sme user can not delete branch");

      Session nonSmeUserSession = new Session.Builder(x)
        .setUserId(nonSmeUser.getId())
        .build();

      X nonSmeContext = nonSmeUserSession.applyTo(x);

      threw = false;
      try {
        branchDAO.inX(nonSmeContext).put(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Non sme user can't add branch");

      threw = false;
      try {
        branchDAO.inX(nonSmeContext).find(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Non sme user can't view branch");

      threw = false;
      try {
        branchDAO.inX(nonSmeContext).put(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Non sme user can't update branch");

      threw = false;
      try {
        branchDAO.inX(nonSmeContext).remove(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Non sme user can't delete branch");

      Session adminUserSession = new Session.Builder(x)
        .setUserId(adminUser.getId())
        .build();

      X adminContext = adminUserSession.applyTo(x);

      threw = false;
      try {
        branchDAO.inX(adminContext).put(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can add branch");

      threw = false;
      try {
        branchDAO.inX(adminContext).find(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can view branch");

      threw = false;
      try {
        branchDAO.inX(adminContext).put(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can update branch");

      threw = false;
      try {
        branchDAO.inX(adminContext).remove(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can delete branch");
    `
    }

  ]
})
