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
  name: 'FOPPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'A planner for planning Free of Payment (FOP) type transactions',

  javaImports: [
    'net.nanopay.tx.SecurityTransaction',
    'net.nanopay.account.SecuritiesAccount',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

        SecurityTransaction secTx = new SecurityTransaction.Builder(x).build();
        secTx.copyFrom(requestTxn);
        secTx.setLineItems(requestTxn.getLineItems());
        secTx.setName("Digital Security Transaction");
        secTx.setDestinationAmount(secTx.getAmount());
        quote.addTransfer(true, ((SecuritiesAccount) quote.getSourceAccount()).getSecurityAccount(x, quote.getSourceUnit()).getId(), -secTx.getAmount(), 0);
        quote.addTransfer(true, ((SecuritiesAccount) quote.getDestinationAccount()).getSecurityAccount(x, quote.getDestinationUnit()).getId(), secTx.getAmount(), 0);
        return secTx;
      `
    }
  ]
});
