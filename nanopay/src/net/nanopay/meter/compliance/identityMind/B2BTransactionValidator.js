foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'B2BTransactionValidator',

  documentation: 'Validates bank to bank transaction via IdentityMind Transfer API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Transaction transaction = (Transaction) obj;
        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
        IdentityMindResponse response = identityMindService.evaluateTransfer(x, transaction);
        // if rejected or marked as manual review by IDM then throws exception
        ruler.putResult(response.getStatusCode() == 200
          ? response.getFrp()
          : "Error");
      `
    }
  ]
});
