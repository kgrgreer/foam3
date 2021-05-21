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
  name: 'DigitalTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for planning digital transactions',

  javaImports: [
    'net.nanopay.tx.DigitalTransaction',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

        DigitalTransaction dt = new DigitalTransaction();
        dt.copyFrom(requestTxn);
        dt.setLineItems(requestTxn.getLineItems());
        dt.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
        dt.setName(dt.getSourceCurrency() + " Digital Transaction");
        quote.addTransfer(true, dt.getSourceAccount(), -dt.getAmount(), 0);
        quote.addTransfer(true, dt.getDestinationAccount(), dt.getAmount(), 0);
        return dt;
      `
    },
  ]
});

