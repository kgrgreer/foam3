foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'EntityLoginValidator',

  documentation: 'Records entity login through IdentityMind Entity Login Record API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.auth.LoginAttempt'
  ],

  properties: [
    {
      class: 'Int',
      name: 'stage',
      value: 2
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        LoginAttempt login = (LoginAttempt) obj;
        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
        IdentityMindResponse response = identityMindService.recordLogin(
          x, login, getStage());
        ruler.putResult(response.getStatusCode() == 200
          ? response.getFrp()
          : "Error");
      `
    }
  ]
});
