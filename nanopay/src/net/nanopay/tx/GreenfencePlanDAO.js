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
  package: 'net.nanopay.tx',
  name: 'GreenfencePlanDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  messages: [
    { name: 'INVOICE1_QUOTE_NOT_FOUND_ERROR_MSG', message: 'GreenFencePlanDAO: no quote was found for invoice1' },
    { name: 'INVOICE2_QUOTE_NOT_FOUND_ERROR_MSG', message: 'GreenFencePlanDAO: no quote was found for invoice2' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public GreenfencePlanDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction txn = quote.getRequestTransaction();
        if ( ! ( txn instanceof GreenfenceTransaction ) ) {
          return super.put_(x, quote);
        }
        DAO quoteDAO = ((DAO) x.get("localTransactionQuotePlanDAO"));
        User greenfenceUser = (User) ((DAO) x.get("localUserDAO")).find(1013L);
        InvoiceTransaction invoice1 = new InvoiceTransaction.Builder(x)
          .setSourceAccount(txn.getSourceAccount())
          .setDestinationAccount(DigitalAccount.findDefault(x, greenfenceUser, txn.getSourceCurrency()).getId())
          .setAmount(txn.getAmount())
          .setPayable(true)
          .build();
        invoice1.addLineItems(txn.getLineItems());
  
        InvoiceTransaction invoice2 = new InvoiceTransaction.Builder(x)
          .setSourceAccount(DigitalAccount.findDefault(x, greenfenceUser, txn.getSourceCurrency()).getId())
          .setDestinationAccount(txn.getDestinationAccount())
          .setAmount(txn.getAmount())
          .build();
        invoice2.addLineItems(txn.getLineItems());
  
        TransactionQuote q1 = new TransactionQuote.Builder(x)
          .setRequestTransaction(invoice1)
          .build();
        TransactionQuote c1 = (TransactionQuote) quoteDAO.put_(x, q1);
        Transaction tx1;
        if ( null != c1.getPlan() ) {
          tx1 = c1.getPlan();
          //txn.addNext(tx1);
          txn.addLineItems(tx1.getLineItems());
        } else {
          ((Logger)getX().get("logger")).error(INVOICE1_QUOTE_NOT_FOUND_ERROR_MSG);
          throw new RuntimeException(INVOICE1_QUOTE_NOT_FOUND_ERROR_MSG);
        }
  
        TransactionQuote q2 = new TransactionQuote.Builder(x)
          .setRequestTransaction(invoice2)
          .build();
        TransactionQuote c2 = (TransactionQuote) quoteDAO.put_(x, q2);
        Transaction tx2;
        if ( null != c2.getPlan() ) {
          tx2 = c2.getPlan();
          //txn.addNext(tx2);
          txn.addLineItems(tx2.getLineItems());
        } else {
          ((Logger)getX().get("logger")).error(INVOICE2_QUOTE_NOT_FOUND_ERROR_MSG);
          throw new RuntimeException(INVOICE2_QUOTE_NOT_FOUND_ERROR_MSG);
        }
        Transaction parent = txn.findParent(x);
        if ( parent != null && parent instanceof GreenfenceTransaction ) {
          tx1.addNext(tx2);
          tx1.setParent(txn.getParent());
          quote.setPlan(tx1);
          return quote;
        }
        txn.addNext(tx1);
        txn.addNext(tx2);
        quote.setPlan(txn);
        return quote; 
      `
    }
  ]
});
