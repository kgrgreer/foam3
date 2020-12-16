foam.CLASS({
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SigningOfficerByDefaultRule',

  implements: [
      'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CrunchService',
    'net.nanopay.crunch.onboardingModels.SigningOfficerQuestion',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, agencyX -> {
          User realUser = ((Subject) agencyX.get("subject")).getRealUser();
          Subject subject = new Subject.Builder(x).build();
          subject.setUser(realUser);
          subject.setUser((User) obj.fclone());
          X subjectX = agencyX.put("subject", subject);


          CrunchService crunchService = (CrunchService) x.get("crunchService");

          // Signing officer question
          {
            var data = new SigningOfficerQuestion.Builder(agencyX)
              .setIsSigningOfficer(true)
              .build();
            crunchService.updateUserJunction(
              ruler.getX(), subject, "554af38a-8225-87c8-dfdf-eeb15f71215f-0",
              data, GRANTED);
          }

          // Certify data reviewed
          {
            var data = new CertifyDataReviewed.Builder(subjectX)
              .setReviewed(true)
              .setSigningOfficer(realUser.getId())
              .build();
            crunchService.updateUserJunction(
              ruler.getX(), subject, "554af38a-8225-87c8-dfdf-eeb15f71215f-14",
              data, GRANTED);
          }

        }, "Add signing officer capability");
      `
    }
  ],
});
