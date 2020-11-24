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
  name: 'InterTrustPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',
  documentation: 'A generic implementation of the InterTrustPlanner',

  javaImports: [
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.cico.InterTrustTransaction'
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        InterTrustTransaction t = new InterTrustTransaction();
        t.copyFrom(requestTxn);
        t.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
        addInterTrustTransfers(x, t, quote);

        return t;
    `
    },
    {
      name: 'addInterTrustTransfers',
      args: [
        { name: 'x', type: 'Context' },
        { name: 't', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote' },
      ],
      javaCode: `
        TrustAccount trustAccountFrom = TrustAccount.find(x, quote.getSourceAccount());
        TrustAccount trustAccountTo = TrustAccount.find(x, quote.getDestinationAccount());

        //Stage 0 CO transfers
        quote.addTransferAdvanced(true, trustAccountFrom.getId(), t.getAmount(), 0);
        quote.addTransferAdvanced(true, quote.getSourceAccount().getId(), -t.getAmount(), 0);
        quote.addTransferAdvanced(false, trustAccountTo.getReserveAccount(), t.getAmount(), 0);
        //Stage 1 CI Transfers
        quote.addTransferAdvanced(true, trustAccountTo.getId(), -t.getAmount(), 1);
        quote.addTransferAdvanced(true, quote.getDestinationAccount().getId(), t.getAmount(), 1);
        quote.addTransferAdvanced(false, trustAccountFrom.getReserveAccount(), -t.getAmount(), 1);
      `
    }
  ]
});
