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
    package: 'net.nanopay.tx.ruler',
    name: 'InvoiceTransactionAfterPutRule',

    documentation: 'Invoice transaction after put rule.',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'net.nanopay.tx.InvoiceTransaction',
      'net.nanopay.tx.model.TransactionStatus',
      'net.nanopay.tx.TransactionLineItem'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            InvoiceTransaction oldTxn = (InvoiceTransaction) oldObj;
            InvoiceTransaction txn    = (InvoiceTransaction) obj;

            if ( txn.getServiceCompleted() == 100 ) {
              return;
            }
            InvoiceTransaction child = new InvoiceTransaction();
            child.copyFrom(txn);
            child.setId("");
            child.setServiceCompleted(100);
            child.setStatus(TransactionStatus.PENDING);

            TransactionLineItem[] lineItems = oldTxn.getLineItems();
            for ( int i = 0; i < lineItems.length; i++ ) {
              lineItems[i].setAmount((long)(lineItems[i].getAmount()*0.01*(100 - txn.getServiceCompleted())));
            }
            child.setLineItems(lineItems);
            txn.getChildren(x).put(child);
          }
        }, "Invoice Transaction After Put Logic");
        `
      }
    ]
  });
