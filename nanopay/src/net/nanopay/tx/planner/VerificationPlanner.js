foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'VerificationPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'A planner for micro deposit bank verification transactions',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.cico.VerificationTransaction'

  ],

  properties: [
    {
      class: 'Long',
      name: 'verifierAccount'
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        // TODO: Uncomment this code when we enable proper verification transactions.
        // Transaction tOut = new Transaction();
        // tOut.copyFrom(requestTxn);
        // Transaction tIn = new Transaction();
        // tIn.copyFrom(requestTxn);

        // tOut.setSourceAccount(getVerifierAccount());

        // tIn.setDestinationAccount(getVerifierAccount());

        // Transaction[] outs = multiQuoteTxn(x, tOut);
        // Transaction[] ins = multiQuoteTxn(x, tIn);

        // for ( Transaction t1 : ins ) {
        //   for ( Transaction t2 : outs ) {
        //     VerificationTransaction vt = (VerificationTransaction) requestTxn.fclone();
        //     vt.setName("Verification Transaction");
        //     vt.addNext(t1);
        //     vt.addNext(t2);
        //     quote.getAlternatePlans_().add(vt);
        //   }
        // }
        // return null;
        requestTxn = (VerificationTransaction) requestTxn.fclone();
        return requestTxn;
      `
    }
  ]
});
