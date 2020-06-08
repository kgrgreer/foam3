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
  package: 'net.nanopay.meter.clearing.ruler.predicate',
  name: 'DefaultClearingTimeRulePredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `The default predicate for ClearingTimeRule.

    Checking if transaction is a CICO transaction and status changes to SENT.`,

  javaImports: [
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          OR(
            EQ(DOT(NEW_OBJ, INSTANCE_OF(CITransaction.class)), true),
            EQ(DOT(NEW_OBJ, INSTANCE_OF(COTransaction.class)), true),
            EQ(DOT(NEW_OBJ, INSTANCE_OF(VerificationTransaction.class)), true)
          ),
          NEQ(DOT(OLD_OBJ, Transaction.STATUS), TransactionStatus.SENT),
          EQ(DOT(NEW_OBJ, Transaction.STATUS), TransactionStatus.SENT)
        ).f(obj);
      `
    }
  ]
});
