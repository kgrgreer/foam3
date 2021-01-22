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
  name: 'CheckReserveAccountFor',

  documentation: `For transactionQuote use only.. gets the source or destination account off requesttransaction, then finds its trust and corresponding reserveAccount. then it compares bankproperty on the bank to the bank value provided.
  Example: source: true, property: institutionNumber, Value: "BMO". therefore if the source account on txn has a trust with a reserve account that has a property named instituitionNumber and it is set to bmo then return true. if somethings wrong just return false`,

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
    'net.nanopay.tx.TransactionQuote'
  ],

  properties: [
    {
      class: 'String',
      name: 'bankProperty'
    },
    {
      class: 'Object',
      name: 'bankValue'
    },
    {
      class: 'Boolean',
      name: 'source',
      value: true
    },
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
        try {
          if ( getIsNew() )
            theObj  = (FObject) NEW_OBJ.f(obj);
          else
            theObj = (FObject) OLD_OBJ.f(obj);
          TransactionQuote quote = (TransactionQuote) theObj;
          Transaction t = quote.getRequestTransaction();
          TrustAccount trust;
          if (getSource())
            trust = (TrustAccount) (((DigitalAccount) quote.getSourceAccount()).findTrustAccount(x));
          else
            trust = (TrustAccount) (((DigitalAccount) quote.getDestinationAccount()).findTrustAccount(x));
          BankAccount res = (BankAccount) trust.findReserveAccount(x);
          Boolean answer = EQ(res.getClassInfo().getAxiomByName(getBankProperty()), getBankValue()).f(res);
          return answer;
        } catch(RuntimeException e) {
          return false; 
        }
      `
    }
  ]
});
