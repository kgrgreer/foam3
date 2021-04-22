/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  name: 'CreditCodeTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for adding transfers to creditcode Transactions',

  javaImports: [
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.tx.creditengine.CreditCodeTransaction',
    'net.nanopay.tx.creditengine.CreditCodeAccount'
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

      CreditCodeTransaction credit = new CreditCodeTransaction();
      credit.copyFrom(requestTxn);
      credit.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
      credit.setSourceCurrency(quote.getSourceAccount().getDenomination());
      credit.setDestinationCurrency(quote.getDestinationAccount().getDenomination());

      quote.addTransfer(false, credit.getSourceAccount(), credit.getAmount(), 0);
      // if a secondary credit account is specified fill that in too.
      if ( (! SafetyUtil.equals(credit.getDestinationAccount(), credit.getSourceAccount())) && (! SafetyUtil.isEmpty( credit.getDestinationAccount() )) ) {
        quote.addTransfer(false, credit.getDestinationAccount(), credit.getDestinationAmount(), 0);
      }
      return credit;

      `
    }
  ]
});

