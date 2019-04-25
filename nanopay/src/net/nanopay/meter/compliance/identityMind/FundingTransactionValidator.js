foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'FundingTransactionValidator',

  documentation: 'Validates Cash-in transaction via IdentityMind Funding API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.tx.cico.CITransaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        CITransaction transaction = (CITransaction) obj;
        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
        IdentityMindResponse response = identityMindService.evaluateFunding(x, transaction);
        // if rejected or marked as manual review by IDM then throws exception
        ruler.putResult(response.getStatusCode() == 200
          ? response.getFrp()
          : "Error");
      `
    }
  ]
});
