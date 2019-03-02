/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.tx.realex;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.DigitalAccount;
import net.nanopay.cico.model.RealexPaymentAccountInfo;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class RealexTransactionPlanDAO
  extends ProxyDAO {

  public RealexTransactionPlanDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof TransactionQuote ) ) {
      return getDelegate().put_(x, obj);
    }
    TransactionQuote quote = (TransactionQuote) obj;
    if ( ! ( quote.getRequestTransaction() instanceof RealexTransaction) ) {
      return getDelegate().put_(x, obj);
    }
    RealexTransaction transaction = (RealexTransaction) quote.getRequestTransaction();

    RealexPaymentAccountInfo paymentAccountInfo = (RealexPaymentAccountInfo) transaction.getPaymentAccountInfo();
    if ( paymentAccountInfo.getType() == net.nanopay.cico.CICOPaymentType.MOBILE && transaction.getStatus() == TransactionStatus.COMPLETED ) {
      // TODO: create Transfer, not Transaction
      // Transfer transfer = new   -- need debig and credit.
      // Transaction txn = new Transaction.Builder(getX())
      //   .setPayerId(transaction.getPayerId())
      //   .setPayeeId(3797) //TODO: create fee collector user
      //   .setStatus(TransactionStatus.COMPLETED)
      //   .setAmount(paymentAccountInfo.getFee())
      //   .build();
      // PlanTransaction plan = new PlanTransaction.Builder(x).build();
      // plan.add(x, transaction);
      // plan.add(x, txn);
      // quote.add(x, plan);
    }
    return super.put_(x, quote);
  }
}
