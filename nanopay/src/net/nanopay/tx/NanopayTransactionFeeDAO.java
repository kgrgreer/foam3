/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.EQ;
import foam.nanos.auth.User;
import java.util.List;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionFee;

public class NanopayTransactionFeeDAO extends ProxyDAO {

  public static final long NANOPAY_FEE_ACCOUNT_ID = 2l;
  public NanopayTransactionFeeDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction = (Transaction) obj;
    DAO transactionFeesDAO = (DAO) x.get("transactionFeesDAO");
    List applicableFees = ((ArraySink) transactionFeesDAO
        .where(EQ(TransactionFee.TRANSACTION_CLASS, transaction.getCls())) //REVIEW: Evaluate Max Amount
        .select(new ArraySink())).getArray();

    if ( applicableFees.size() > 0 ) {
      for (Object applicableFee : applicableFees) {
        TransactionFee fee = (TransactionFee) applicableFee;
        Long feeAccount = fee.getFeeAccount();
        if ( null == feeAccount ) feeAccount = NANOPAY_FEE_ACCOUNT_ID; //REVEIW

        Transfer[] tr = new Transfer [] {
          new Transfer.Builder(x).setAccount(transaction.getSourceAccount())
              .setAmount(-fee.getFee().getFee(transaction.getAmount())).build(),
          new Transfer.Builder(x).setAccount(feeAccount)
              .setAmount(fee.getFee().getFee(transaction.getAmount())).build()
        };
        transaction.add(tr);
      }

    }

    return super.put_(x, transaction);
  }
}
