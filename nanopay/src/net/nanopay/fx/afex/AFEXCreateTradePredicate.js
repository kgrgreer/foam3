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
  name: 'AFEXCreateTradePredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'static foam.mlang.MLang.*',
    'net.nanopay.fx.afex.AFEXFundingTransaction',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      return AND(
        EQ(DOT(NEW_OBJ, INSTANCE_OF(AFEXTransaction.class)), true),
        NEQ(DOT(NEW_OBJ, INSTANCE_OF(AFEXFundingTransaction.class)), true),
        EQ(DOT(NEW_OBJ, AFEXTransaction.STATUS), TransactionStatus.PENDING_PARENT_COMPLETED),
        EQ(DOT(NEW_OBJ, AFEXTransaction.AFEX_TRADE_RESPONSE_NUMBER), 0)
      ).f(obj);
      `
    }
  ]
});
