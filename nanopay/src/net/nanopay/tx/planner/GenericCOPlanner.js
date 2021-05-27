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
  name: 'GenericCOPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for doing Cash outs for any currency instantly.',

  javaImports: [
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.cico.COTransaction',
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

      COTransaction cashOut = new COTransaction();
      cashOut.copyFrom(requestTxn);
      cashOut.setLineItems(requestTxn.getLineItems());
      cashOut.setName("Cash Out of "+cashOut.getSourceCurrency());
      // use destinations trust, need system context.
      TrustAccount trustAccount = ((DigitalAccount) quote.getSourceAccount()).findTrustAccount(x);

      int stage = getInstantComplete() ? 1 : 0;
      quote.addTransfer(true, trustAccount.getId(), cashOut.getAmount(), stage);
      quote.addTransfer(true, quote.getSourceAccount().getId(), -cashOut.getAmount(), stage);
      quote.addTransfer(false, quote.getDestinationAccount().getId(), cashOut.getAmount(), 1);

      if ( getInstantComplete() ) {
        cashOut.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
      } else {
        cashOut.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
      }

      return cashOut;

      `
    }
  ]
});

