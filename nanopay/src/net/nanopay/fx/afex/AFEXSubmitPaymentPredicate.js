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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXSubmitPaymentPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'net.nanopay.fx.afex.AFEXFundingTransaction',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      if ( ! (NEW_OBJ.f(obj) instanceof AFEXTransaction) ) return false;
      if ( NEW_OBJ.f(obj) instanceof AFEXFundingTransaction ) return false;
      AFEXTransaction afexTransaction = (AFEXTransaction) NEW_OBJ.f(obj);
      return afexTransaction.getStatus() == TransactionStatus.PENDING
        && SafetyUtil.isEmpty( afexTransaction.getExternalInvoiceId() );
      `
    }
  ]
});
