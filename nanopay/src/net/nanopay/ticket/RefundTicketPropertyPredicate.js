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
  package: 'net.nanopay.ticket',
  name: 'RefundTicketPropertyPredicate',

  documentation: `For Refund Ticket use only.. compares txn properties with values provided works like mlang.EQ but digs the request txn out of ticket first`,
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.DOT',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.ticket.RefundTicket',
    'static foam.mlang.MLang.NEW_OBJ',
    'foam.util.SafetyUtil',
    'foam.mlang.predicate.IsClassOf',
    'static foam.mlang.MLang.INSTANCE_OF'
  ],

  properties: [
    {
      class: 'String',
      name: 'txnProperty',
      documentation: 'The property that is to be checked. "class" checks isClassOf, "instance" checks instanceOf'
    },
    {
      class: 'Object',
      name: 'txnValue',
      documentation: 'The value that is compared to the found property value of txnProperty'
    },
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      FObject theObj;
      X x = (X) obj;
      RefundTicket ticket = (RefundTicket) NEW_OBJ.f(obj);
      DAO txnDAO = (DAO) x.get("localTransactionDAO");
      Transaction txn = (Transaction) txnDAO.find(ticket.getRefundTransaction());
      if ( txn == null ) {
        return false;
      }
      if ( txn instanceof SummaryTransaction || txn instanceof FXSummaryTransaction ) {
        txn = txn.getStateTxn(x);
      }
      if (SafetyUtil.equals(getTxnProperty(), "class")) {
        return (new IsClassOf( (foam.core.ClassInfo) getTxnValue())).f(txn);
      }
      if (SafetyUtil.equals(getTxnProperty(), "instance")) {
        return INSTANCE_OF( ((foam.core.ClassInfo) getTxnValue()).getObjClass()).f(txn);
      }
      return EQ(txn.getClassInfo().getAxiomByName(getTxnProperty()), getTxnValue()).f(txn);
      `
    }
  ]
});
