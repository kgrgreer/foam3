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
    'net.nanopay.crunch.onboardingModels.SigningOfficerQuestion'
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
          crunchService.updateJunction(
            subjectX, "554af38a-8225-87c8-dfdf-eeb15f71215f-0", data, null);
        }, "Add signing officer capability");
      `
    }
  ],
});