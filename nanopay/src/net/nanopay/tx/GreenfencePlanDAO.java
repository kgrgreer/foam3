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
    User greenfenceUser = (User) ((DAO) x.get("localUserDAO")).find(1013);
    InvoiceTransaction invoice1 = new InvoiceTransaction.Builder(x)
      .setSourceAccount(txn.getSourceAccount())
      .setDestinationAccount(DigitalAccount.findDefault(x, greenfenceUser, txn.getSourceCurrency()).getId())
      .setAmount(txn.getAmount())
      .build();
    TransactionQuote q1 = new TransactionQuote.Builder(x)
      .setRequestTransaction(invoice1)
      .build();
    TransactionQuote c1 = (TransactionQuote) quoteDAO.put_(x, q1);
    Transaction tx1;
    if ( null != c1.getPlan() ) {
      tx1 = c1.getPlan();
    } else {
      throw new RuntimeException("GreenFencePlanDAO: no quote was found for invoice1");
    }

    InvoiceTransaction invoice2 = new InvoiceTransaction.Builder(x)
      .setSourceAccount(DigitalAccount.findDefault(x, greenfenceUser, txn.getSourceCurrency()).getId())
      .setDestinationAccount(txn.getDestinationAccount())
      .setAmount(txn.getAmount())
      .setPayable(true)
      .build();
    TransactionQuote q2 = new TransactionQuote.Builder(x)
      .setRequestTransaction(invoice2)
      .build();
    TransactionQuote c2 = (TransactionQuote) quoteDAO.put_(x, q2);
    if ( null != c2.getPlan() ) {
      Transaction tx2 = c2.getPlan();
      tx1.addNext(tx2);
    } else {
      throw new RuntimeException("GreenFencePlanDAO: no quote was found for invoice2");
    }
    quote.setPlan(tx1);
    return quote;
  }
}
