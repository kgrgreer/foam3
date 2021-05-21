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
  name: 'GenericCIPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for doing Cash Ins for any currency instantly.',

  javaImports: [
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.account.TrustAccount',
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    },
    {
      class: 'Boolean',
      name: 'instantComplete',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

      CITransaction cashIn = new CITransaction();
      cashIn.copyFrom(requestTxn);
      cashIn.setName("Cash In of "+cashIn.getSourceCurrency());
      // i think these are backwards.. should use the trust of the dest accnt here.
      cashIn.setLineItems(requestTxn.getLineItems());
      TrustAccount trustAccount = ((DigitalAccount) quote.getDestinationAccount()).findTrustAccount(x);

      quote.addTransfer(true, trustAccount.getId(), - cashIn.getAmount(), 0);
      quote.addTransfer(true, quote.getDestinationAccount().getId(), cashIn.getAmount(), 0);
      quote.addTransfer(false, quote.getSourceAccount().getId(), - cashIn.getAmount(), 0);

      if ( getInstantComplete() ) {
        cashIn.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
      } else {
        cashIn.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
      }

      return cashIn;

      `
    }
  ]
});

