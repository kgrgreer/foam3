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
 package: 'net.nanopay.payment',
 name: 'InstitutionAuthorizerTest',
 extends: 'foam.nanos.test.Test',
 documentation: `class to test InstitutionDAO security`,

 javaImports: [
  'foam.core.X',
  'foam.dao.DAO',
  'foam.nanos.auth.AuthorizationException',
  'foam.nanos.auth.User',
  'foam.nanos.session.Session'
 ],

 methods: [
  {
    name: 'runTest',
    javaCode: `
      User smeUser = new User();
      User nonSmeUser = new User();
      Institution institution = new Institution();

      boolean threw;

      smeUser.setGroup("sme");
      nonSmeUser.setGroup("");

      DAO institutionDAO = (DAO) x.get("institutionDAO");
      DAO bareUserDAO = (DAO) x.get("bareUserDAO");

      smeUser = (User) bareUserDAO.put(smeUser);
      nonSmeUser = (User) bareUserDAO.put(nonSmeUser);

      Session smeUserSession = new Session.Builder(x)
        .setUserId(smeUser.getId())
        .build();

      X smeContext = smeUserSession.applyTo(x);

      threw = false;
      try {
        institutionDAO.inX(smeContext).put(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Sme user can add institution");

      threw = false;
      try {
        institutionDAO.inX(smeContext).find(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Sme user can view institution");

      threw = false;
      try {
        institution.setAbbreviation("IT");
        institutionDAO.inX(smeContext).put(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Sme user can not update institution");

      threw = false;
      try {
        institutionDAO.inX(smeContext).remove(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Sme user can not delete institution");

      Session nonSmeUserSession = new Session.Builder(x)
        .setUserId(nonSmeUser.getId())
        .build();

      X nonSmeContext = nonSmeUserSession.applyTo(x);

      threw = false;
      try {
        institutionDAO.inX(nonSmeContext).put(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Non sme user can't add institution");

      test(institutionDAO.inX(nonSmeContext).find(institution) == null, "Non sme user can't view institution");

      threw = false;
      try {
        institutionDAO.inX(nonSmeContext).put(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Non sme user can't update institution");

      threw = false;
      try {
        institutionDAO.inX(nonSmeContext).remove(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Non sme user can't delete institution");

      threw = false;
      try {
        institutionDAO.inX(x).put(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can add institution");

      threw = false;
      try {
        institutionDAO.inX(x).find(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can view institution");

      threw = false;
      try {
        institutionDAO.inX(x).put(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can update institution");

      threw = false;
      try {
        institutionDAO.inX(x).remove(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(! threw, "Admin user can delete institution");
    `
  }
 ]
})
