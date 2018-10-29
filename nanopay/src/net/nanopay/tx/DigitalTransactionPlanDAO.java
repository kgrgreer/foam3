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
import net.nanopay.tx.model.Transaction;

public class DigitalTransactionPlanDAO extends ProxyDAO {

  public DigitalTransactionPlanDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    
    TransactionQuote quote = (TransactionQuote) obj;
    Transaction txn = (Transaction) quote.getRequestTransaction().fclone();
    if ( txn.findSourceAccount(x) instanceof DigitalAccount && txn.findDestinationAccount(x) instanceof DigitalAccount ) {
      if ( txn.getSourceCurrency() == txn.getDestinationCurrency() ) {
        txn.setIsQuoted(true);
        quote.addPlan(txn);
      }
    }
    return super.put_(x, quote);
  }
}
