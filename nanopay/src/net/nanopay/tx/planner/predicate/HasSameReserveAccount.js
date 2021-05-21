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
  package: 'net.nanopay.tx.planner.predicate',
  name: 'HasSameReserveAccount',

  documentation: `true if both source and destination accounts off requestTransaction from transactionQuote
  have a trust and a reserve account that has the same id`,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'static foam.mlang.MLang.*',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'foam.util.SafetyUtil',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'isNew',
      value: true
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        FObject theObj;
        X x = (X) obj;
        if ( getIsNew() )
          theObj  = (FObject) NEW_OBJ.f(obj);
        else
          theObj = (FObject) OLD_OBJ.f(obj);
        TransactionQuote quote = (TransactionQuote) theObj;
        Transaction t = quote.getRequestTransaction();

        TrustAccount trust1 = (TrustAccount) (((DigitalAccount) quote.getSourceAccount()).findTrustAccount(x));
        TrustAccount trust2 = (TrustAccount) (((DigitalAccount) quote.getDestinationAccount()).findTrustAccount(x));

        BankAccount res1 = (BankAccount) trust1.findReserveAccount(x);
        BankAccount res2 = (BankAccount) trust2.findReserveAccount(x);

        return SafetyUtil.equals(res1.getId(),res2.getId());
      `
    }
  ]
});
