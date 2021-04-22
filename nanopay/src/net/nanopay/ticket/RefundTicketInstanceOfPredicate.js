/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  name: 'RefundTicketInstanceOfPredicate',

  documentation: `For Refund Ticket use only.. uses instanceOf on class with class provided works like mlang.INSTANCE_OF but digs the request txn out of ticket first`,
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.mlang.predicate.IsInstanceOf',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.SummarizingTransaction',
    'net.nanopay.tx.TransactionException',
    'static foam.mlang.MLang.NEW_OBJ'
  ],

  properties: [
    {
      class: 'Class',
      name: 'instanceOf',
      documentation: 'The class that is to be checked'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      X x = (X) obj;
      RefundTicket ticket = (RefundTicket) NEW_OBJ.f(obj);
      DAO txnDAO = (DAO) x.get("localTransactionDAO");
      Transaction txn = (Transaction) txnDAO.find(ticket.getProblemTransaction());
      if ( txn == null ) {
        Logger logger = (Logger) x.get("logger");
        logger.error("RefundTicketInstanceOfPredicate has failed, because txn find returned null "+ ticket.getId());
        throw new TransactionException("RefundTicketInstanceOfPredicate has failed, because txn find returned null "+ ticket.getId());
      }
      if ( txn instanceof SummarizingTransaction ) {
        txn = txn.getStateTxn(x);
      }
      IsInstanceOf predicate = new IsInstanceOf(getInstanceOf());
      return predicate.f(txn);
      `
    }
  ]
});
