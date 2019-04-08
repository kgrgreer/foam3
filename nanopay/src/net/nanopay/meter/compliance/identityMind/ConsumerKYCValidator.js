foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ConsumerKYCValidator',

  documentation: 'Validates a user using IdentityMind Consumer KYC Evaluation API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'Int',
      name: 'stage',
      value: 1
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
        IdentityMindResponse response = identityMindService.evaluateConsumer(
          x, user, getStage());
        ruler.putResult(response.getStatusCode() == 200
          ? response.getFrp()
          : "Error");
      `
    }
  ]
});
