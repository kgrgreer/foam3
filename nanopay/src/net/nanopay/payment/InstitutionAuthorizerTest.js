foam.CLASS({
 package: 'net.nanopay.payment',
 name: 'InstitutionAuthorizerTest',
 extends: 'foam.nanos.test.Test',
 documentation: `class to test InstitutionDAO security`,
 flags: ['java'],

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
      }
      catch ( AuthorizationException e ) {
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

      threw = false;
      try {
        institutionDAO.inX(nonSmeContext).find(institution);
      } catch ( AuthorizationException e ) {
        threw = true;
      }
      test(threw, "Non sme user can't view institution");

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
