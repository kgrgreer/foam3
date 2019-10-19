/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class GreenfencePlanDAO extends ProxyDAO {

  public GreenfencePlanDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

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
     invoice1.addLineItems(txn.getLineItems(), null);

     InvoiceTransaction invoice2 = new InvoiceTransaction.Builder(x)
      .setSourceAccount(DigitalAccount.findDefault(x, greenfenceUser, txn.getSourceCurrency()).getId())
      .setDestinationAccount(txn.getDestinationAccount())
      .setAmount(txn.getAmount())
      .build();
    invoice2.addLineItems(txn.getLineItems(), null);

    TransactionQuote q1 = new TransactionQuote.Builder(x)
      .setRequestTransaction(invoice1)
      .build();
    TransactionQuote c1 = (TransactionQuote) quoteDAO.put_(x, q1);
    Transaction tx1;
    if ( null != c1.getPlan() ) {
      tx1 = c1.getPlan();
      //txn.addNext(tx1);
      txn.addLineItems(tx1.getLineItems(), null);
    } else {
      ((Logger)getX().get("logger")).error("GreenFencePlanDAO: no quote was found for invoice1");
      throw new RuntimeException("GreenFencePlanDAO: no quote was found for invoice1");
    }

    TransactionQuote q2 = new TransactionQuote.Builder(x)
      .setRequestTransaction(invoice2)
      .build();
    TransactionQuote c2 = (TransactionQuote) quoteDAO.put_(x, q2);
    Transaction tx2;
    if ( null != c2.getPlan() ) {
      tx2 = c2.getPlan();
      //txn.addNext(tx2);
      txn.addLineItems(tx2.getLineItems(), null);
    } else {
      ((Logger)getX().get("logger")).error("GreenFencePlanDAO: no quote was found for invoice2");
      throw new RuntimeException("GreenFencePlanDAO: no quote was found for invoice2");
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
  }
}
