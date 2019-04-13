foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'MerchantKYCValidator',

  documentation: 'Validates a business using IdentityMind Merchant KYC Evaluation API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.model.Business'
  ],

  properties: [
    {
      class: 'Int',
      name: 'stage',
      value: 3
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Business business = (Business) obj;
        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
        IdentityMindResponse response = identityMindService.evaluateMerchant(
          x, business, getStage());
        ruler.putResult(response.getStatusCode() == 200
          ? response.getFrp()
          : "Error");
      `
    }
  ]
});
