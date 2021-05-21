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
  package: 'net.nanopay.invoice',
  name: 'DetailedInvoiceDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Decorating DAO populating transaction history of the invoice.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.model.Transaction',

    'java.util.*',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);
        if ( obj == null ) {
          return obj;
        }

        Invoice invoice = (Invoice) obj.fclone();
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        ArrayList<FObject> txns = new ArrayList<>();
        Queue<String> q = new LinkedList<>();

        q.add(invoice.getPaymentId());
        while ( ! q.isEmpty() ) {
          Transaction txn = (Transaction) txnDAO.find(q.remove());
          if ( txn == null ) continue;
          txns.add(txn);

          // find all children txns and put them into the queue
          List<String> childTxnId = ((ArraySink) ((foam.mlang.sink.Map) txnDAO
            .where(EQ(Transaction.PARENT, txn.getId()))
            .select(MAP(Transaction.ID, new ArraySink()))).getDelegate()).getArray();
          childTxnId.forEach((childId) -> {
            q.add(childId);
          });
        }

        invoice.setTransactionHistory(txns.toArray(new Transaction[txns.size()]));
        return invoice;
      `
    }
  ]
});
