/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.test',
  name: 'BranchDAOAuthorizationTest',
  extends: 'foam.nanos.test.Test',
  documentation: `class to test BranchDAO security`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'net.nanopay.model.Branch'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `

      User smeUser = new User();
      User nonSmeUser = new User();
      Branch testBranch = new Branch();

      boolean threw;

      smeUser.setGroup("sme");
      nonSmeUser.setGroup("");

      DAO branchDAO = (DAO) x.get("branchDAO");
      DAO bareUserDAO = (DAO) x.get("bareUserDAO");

      smeUser = (User) bareUserDAO.put(smeUser);
      nonSmeUser = (User) bareUserDAO.put(nonSmeUser);

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

      threw = false;
      try {
        testBranch.setClearingSystemIdentification("foo"); // Set an arbitrary property.
        branchDAO.inX(smeContext).put(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Sme user can not update branch");

      threw = false;
      try {
        branchDAO.inX(smeContext).remove(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Sme user can not delete branch");

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

      test( branchDAO.inX(nonSmeContext).find(testBranch) == null, "Non sme user can't view branch");

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

      threw = false;
      try {
        branchDAO.inX(x).put(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can add branch");

      threw = false;
      try {
        branchDAO.inX(x).find(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can view branch");

      threw = false;
      try {
        branchDAO.inX(x).put(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can update branch");

      threw = false;
      try {
        branchDAO.inX(x).remove(testBranch);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can delete branch");
    `
    }
  ]
})
