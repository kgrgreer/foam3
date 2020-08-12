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
  name: 'IntermediaryDestinationAccountSplitPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Split src currency to dest currency via intermediary currency
    when the destination amount is given.

    The source amount will be calculated based on the foreign exchanges from the
    destination currency to the intermediary currency then to the source
    currency.`,

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.account.Account',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    },
    {
      class: 'Long',
      name: 'intermediaryAccountId'
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        if ( requestTxn.getDestinationAmount() > 0 ) {
          var dao = (DAO) x.get("localTransactionPlannerDAO");
          var accountDAO = (DAO) x.get("localAccountDAO");
          var q1 = new TransactionQuote();

          var intermediaryAccount = (Account) accountDAO.find(this.getIntermediaryAccountId());

          // plan intermediary to dest currency (leg2)
          var t1 = (Transaction) requestTxn.fclone();
          t1.clearLineItems();
          t1.setSourceCurrency(intermediaryAccount.getDenomination());
          t1.setAmount(0);
          q1.setParent(quote);
          q1.setRequestTransaction(t1);
          q1.setCorridorsEnabled(false);
          var leg2 = ((TransactionQuote) dao.put(q1)).getPlan();
          if ( leg2 == null ) {
            return null;
          }

          // plan src to intermediary currency (leg1)
          var t2 = (Transaction) requestTxn.fclone();
          t2.setDestinationAccount(intermediaryAccount.getId());
          t2.setDestinationCurrency(intermediaryAccount.getDenomination());
          t2.setDestinationAmount(leg2.getAmount());
          var leg1 = quoteTxn(x, t2, quote, false);

          var fxSummary = new FXSummaryTransaction();
          fxSummary.copyFrom(requestTxn);
          fxSummary.setAmount(leg1.getAmount());
          fxSummary.clearLineItems();
          fxSummary.addNext(createCompliance(fxSummary));

          fxSummary.setStatus(TransactionStatus.COMPLETED);
          fxSummary.addNext(leg1.getNext()[0].getNext()[0]);
          fxSummary.addNext(leg2.getNext()[0].getNext()[0]);
          return fxSummary;
        }
        return null;
      `
    }
  ]
});
