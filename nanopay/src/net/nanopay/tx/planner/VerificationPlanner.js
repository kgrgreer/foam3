/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    },
    {
      name: 'bestPlan',
      value: true
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
