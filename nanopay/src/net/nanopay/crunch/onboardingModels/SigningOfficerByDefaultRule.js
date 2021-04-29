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

          SigningOfficerQuestion data = new SigningOfficerQuestion(agencyX);
          data.setIsSigningOfficer(true);

          CrunchService crunchService = (CrunchService) x.get("crunchService");

          // Signing officer question
          crunchService.updateUserJunction(
            ruler.getX(),
            subject, "crunch.onboarding.signing-officer-question", data, GRANTED);

          // Certify data reviewed
          crunchService.updateUserJunction(
            ruler.getX(),
            subject, "crunch.onboarding.certify-data-reviewed",
            new CertifyDataReviewed.Builder(subjectX)
              .setReviewed(true)
              .setSigningOfficer(realUser.getId())
              .build(),
            GRANTED
          );

        }, "Add signing officer capability");
      `
    }
  ],
});
