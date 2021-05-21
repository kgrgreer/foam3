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
  name: 'BmoCITransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  javaImports: [
    'java.time.Duration',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.bmo.cico.BmoCITransaction'
  ],

  constants: [
    {
      name: 'INSTITUTION_NUMBER',
      type: 'String',
      value: '001'
    },
    {
      name: 'PAYMENT_PROVIDER',
      type: 'String',
      value: 'BMO'
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        TrustAccount trustAccount = ((DigitalAccount) quote.getDestinationAccount()).findTrustAccount(x);
        BmoCITransaction t = new BmoCITransaction();
        t.copyFrom(requestTxn);
        t.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
        t.setInstitutionNumber(INSTITUTION_NUMBER);
        t.setPaymentProvider(PAYMENT_PROVIDER);
        quote.addTransfer(true, trustAccount.getId(), -t.getAmount(), 0);
        quote.addTransfer(true, quote.getDestinationAccount().getId(), t.getAmount(), 0);
        quote.addTransfer(false, quote.getSourceAccount().getId(), -t.getAmount(), 0);

        t.addLineItems(new TransactionLineItem[] {
          new ETALineItem.Builder(x).setEta(Duration.ofDays(1).toMillis()).build()
        });
        if ( PADTypeLineItem.getPADTypeFrom(x, t) == null ) {
          PADTypeLineItem.addEmptyLineTo(t);
        }
        return t;
    `
    }
  ]
});
