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
  name: 'DVPPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'A planner for planning Delivery vs. Payment (DVP) type transactions',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.DVPTransaction',
    'net.nanopay.tx.SecurityTransaction'
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

        DVPTransaction tx = (DVPTransaction) requestTxn.fclone();
        SecurityTransaction fop = new SecurityTransaction();
        Transaction dt = new Transaction.Builder(x).build();

        // create the FOP transaction
        fop.setSourceAccount(tx.getSourceAccount());
        fop.setDestinationAccount(tx.getDestinationAccount());
        fop.setSourceCurrency(tx.getSourceCurrency());
        fop.setDestinationCurrency(tx.getDestinationCurrency());
        fop.setAmount(tx.getAmount());
        tx.addNext(quoteTxn(x, fop, quote));

        //create the Payment digital transaction
        dt.setSourceAccount(tx.getSourcePaymentAccount());
        dt.setDestinationAccount(tx.getDestinationPaymentAccount());
        dt.setSourceCurrency(dt.findSourceAccount(x).getDenomination());
        dt.setDestinationCurrency(dt.findDestinationAccount(x).getDenomination());

        dt.setAmount(tx.getPaymentAmount());
        dt.setDestinationAmount(tx.getDestinationPaymentAmount());

        tx.addNext(quoteTxn(x, dt, quote));

        return tx;
      `
    }
  ]
});
