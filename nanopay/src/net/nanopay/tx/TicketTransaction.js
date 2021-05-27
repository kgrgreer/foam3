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
  package: 'net.nanopay.tx',
  name: 'TicketTransaction',
  extends: 'net.nanopay.tx.CompositeTransaction',
  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.List',
    'static foam.mlang.MLang.EQ',
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.ticket.Ticket',
      name: 'ticketId',
      documentation: `Reference of related ticket`,
    }
  ],

  methods: [
    {
      name: 'getStateTxn',
      javaCode: `
      if ( getStatus() != TransactionStatus.COMPLETED ) {
        return this;
      }
      DAO dao = (DAO) x.get("localTransactionDAO");
      List children = ((ArraySink) dao.where(EQ(Transaction.PARENT, getId())).select(new ArraySink())).getArray();
      Transaction failed = null;
      Transaction resolution = null;
      if ( children.size() > 0 ) {
        Transaction child = (Transaction) children.get(0);
        if (child.getStatus() == TransactionStatus.CANCELLED
          || child.getStatus() == TransactionStatus.DECLINED
          || child.getStatus() == TransactionStatus.FAILED) {
          resolution = ((Transaction) children.get(1)).getStateTxn(x);
          failed = ((Transaction) children.get(0)).getStateTxn(x);
        } else {
          resolution = ((Transaction) children.get(0)).getStateTxn(x);
          failed = ((Transaction) children.get(1)).getStateTxn(x);
        }
        resolution = (Transaction) resolution.fclone();
        resolution.setErrorCode(failed.getErrorCode());
        return resolution;
      }
      return this;
      `
    }
  ]
})
