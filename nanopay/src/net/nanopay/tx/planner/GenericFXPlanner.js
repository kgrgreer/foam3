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
  name: 'GenericFXPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Make a Fx Transaction by simply creating/destroying funds.',

  javaImports: [
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        FXTransaction fx = new FXTransaction();
        fx.copyFrom(requestTxn);
        fx.setName("Foreign Exchange "+quote.getSourceUnit()+" to "+quote.getDestinationUnit());

        quote.addTransfer(true, ((DigitalAccount)quote.getSourceAccount()).getTrustAccount(), fx.getAmount(), 0);
        quote.addTransfer(true, quote.getSourceAccount().getId(), -fx.getAmount(), 0);

        quote.addTransfer(true, ((DigitalAccount)quote.getDestinationAccount()).getTrustAccount(), - fx.getDestinationAmount(), 0);
        quote.addTransfer(true, quote.getDestinationAccount().getId(), fx.getDestinationAmount(), 0);

        fx.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);

        return fx;
      `
    },
  ]
});

