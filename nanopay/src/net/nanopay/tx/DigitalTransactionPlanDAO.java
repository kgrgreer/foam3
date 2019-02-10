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
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class DigitalTransactionPlanDAO extends ProxyDAO {

  public DigitalTransactionPlanDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction txn = quote.getRequestTransaction();
    if ( txn.findSourceAccount(x) instanceof DigitalAccount && txn.findDestinationAccount(x) instanceof DigitalAccount ) {
      if ( txn.getSourceCurrency() == txn.getDestinationCurrency() ) {
        Transaction dt;
        if ( ! ( txn instanceof DigitalTransaction ) ) {
          dt = new DigitalTransaction.Builder(x).build();
          dt.copyFrom(txn);
        } else {
          dt = (Transaction) txn.fclone();
        }
        //dt.setStatus(TransactionStatus.COMPLETED);
        dt.setIsQuoted(true);
        quote.addPlan(dt);
      }
    }
    return super.put_(x, quote);
  }
}
