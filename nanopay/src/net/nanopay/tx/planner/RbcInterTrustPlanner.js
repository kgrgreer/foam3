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
  name: 'RbcInterTrustPlanner',
  extends: 'net.nanopay.tx.planner.InterTrustPlanner',
  documentation: 'The Rbc implementation of the InterTrustPlanner',

  javaImports: [
    'java.time.Duration',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.rbc.RbcInterTrustTransaction'
  ],

  constants: [
      {
        name: 'INSTITUTION_NUMBER',
        type: 'String',
        value: '003'
      },
      {
        name: 'PAYMENT_PROVIDER',
        type: 'String',
        value: 'RBC'
      }
    ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        RbcInterTrustTransaction t = new RbcInterTrustTransaction();
        t.copyFrom(requestTxn);
        t.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
        t.setInstitutionNumber(INSTITUTION_NUMBER);
        t.setPaymentProvider(PAYMENT_PROVIDER);
        t.setPlanCost(t.getPlanCost() + 1);

        addInterTrustTransfers(x, t, quote);

        t.addLineItems(new TransactionLineItem[] {
          new ETALineItem.Builder(x).setEta(Duration.ofDays(1).toMillis()).build()
        });
        if ( PADTypeLineItem.getPADTypeFrom(x, t) == null ) {
          PADTypeLineItem.addEmptyLineTo(t);
        }

        return t;
    `
    },
  ]
});
