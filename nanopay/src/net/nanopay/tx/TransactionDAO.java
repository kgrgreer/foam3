/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.ProxyDAO;
import foam.dao.ReadOnlyDAO;
import foam.nanos.logger.Logger;

import java.util.*;

import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/**
 * TransactionDAO maintains the memory-only writable BalanceDAO,
 * and performs all put operations.
 * ReadOnly access is provided via getBalanceDAO. see LocalBalanceDAO
 */
public class TransactionDAO
  extends ProxyDAO
{
  // blacklist of status where balance transfer is not performed
  protected final Set<TransactionStatus> STATUS_BLACKLIST =
    Collections.unmodifiableSet(new HashSet<TransactionStatus>() {{
      add(TransactionStatus.REFUNDED);
      add(TransactionStatus.PENDING);
    }});

  protected DAO accountDAO_;
  protected DAO balanceDAO_;
  protected DAO userDAO_;
  private   DAO writableBalanceDAO_ = new foam.dao.MDAO(Balance.getOwnClassInfo());

  public TransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public TransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }


  protected DAO getBalanceDAO() {
    if ( balanceDAO_ == null ) {
      balanceDAO_ = new ReadOnlyDAO.Builder(getX()).setDelegate(writableBalanceDAO_).build();
    }
    return balanceDAO_;
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) {
      userDAO_ = (DAO) getX().get("localUserDAO");
    }
    return userDAO_;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj instanceof CompositeTransaction ) {
      return super.put_(x, obj);
    }

    Transaction transaction  = (Transaction) obj;
    Transaction oldTxn       = (Transaction) getDelegate().find(obj);

    // don't perform balance transfer if status in blacklist

    if ( STATUS_BLACKLIST.contains(transaction.getStatus()) && transaction.getType() != TransactionType.NONE &&
         ! (transaction instanceof COTransaction) ) {
      return super.put_(x, obj);
    }

    if ( transaction instanceof CITransaction ) {
      //if old txn was previosly compketed and noe declined or if transaction comes as completed - execute transfers
      if ( transaction.getStatus() == TransactionStatus.DECLINED || transaction.getStatus() == TransactionStatus.COMPLETED ) {
        return executeTransaction(x, transaction);
      }
      return super.put_(x, obj);
    }

    if ( transaction instanceof COTransaction ) {
      if ( oldTxn == null && transaction.getStatus() == TransactionStatus.PENDING ||transaction.getStatus() == TransactionStatus.DECLINED ) {
        return executeTransaction(x, transaction);
      }
      return super.put_(x, obj);
    }

    return executeTransaction(x, transaction);
  }

  FObject executeTransaction(X x, Transaction t) {
    Transfer[] ts = t.createTransfers(x);

    // TODO: disallow or merge duplicate accounts
    if ( ts.length != 1 ) {
      validateTransfers(ts, x);
    }
    return lockAndExecute(x, t, ts, 0);
  }

  void validateTransfers(Transfer[] ts, X x)
    throws RuntimeException
  {

    HashMap hm = new HashMap();

    for ( Transfer tr : ts ) {
      tr.validate();
      Account account = tr.findAccount(x);
      if ( account == null ) throw new RuntimeException("Unknown account: " + tr.getAccount());
      hm.put(account.getDenomination(),( hm.get(account.getDenomination()) == null ? 0 : (Long)hm.get(account.getDenomination())) + tr.getAmount());
    }

    for ( Object value : hm.values() ) {
      if ( (long)value != 0 ) throw new RuntimeException("Debits and credits don't match.");
    }
  }

  /** Sorts array of transfers. **/
  FObject lockAndExecute(X x, Transaction txn, Transfer[] ts, int i) {
    // sort to avoid deadlock
    java.util.Arrays.sort(ts);

    return lockAndExecute_(x, txn, ts, i);
  }

  /** Lock each trasnfer's account then execute the transfers. **/
  FObject lockAndExecute_(X x, Transaction txn, Transfer[] ts, int i) {
    if ( i > ts.length - 1 ) return execute(x, txn, ts);

    synchronized ( ts[i].getLock() ) {
      return lockAndExecute_(x, txn, ts, i + 1);
    }
  }

  /** Called once all locks are locked. **/
  FObject execute(X x, Transaction txn, Transfer[] ts) {
    for ( int i = 0 ; i < ts.length ; i++ ) {
      Transfer t = ts[i];
      Balance balance = (Balance) getBalanceDAO().find(t.getAccount());
      if ( balance == null ) {
        balance = new Balance();
        balance.setId(t.getAccount());
        balance = (Balance) writableBalanceDAO_.put(balance);
      }
      t.validateBalance(x, balance);
    }

    for ( int i = 0 ; i < ts.length ; i++ ) {
      Transfer t = ts[i];
      Balance balance = (Balance) getBalanceDAO().find(t.getAccount());
      t.execute(balance);
      writableBalanceDAO_.put(balance);
    }

    if ( txn.getType().equals(TransactionType.NONE) ) txn.setStatus(TransactionStatus.COMPLETED);

    return getDelegate().put_(x, txn);
  }

  public void cashinReject(X x, Transaction transaction) {
    Balance payerBalance = (Balance) getBalanceDAO().find(transaction.getDestinationAccount());
    payerBalance.setBalance(payerBalance.getBalance() > transaction.getTotal() ? payerBalance.getBalance() -
      transaction.getTotal() : 0);
    getBalanceDAO().put(payerBalance);
  }

  public void paymentFromBankAccountReject(X x, Transaction transaction) {
    Balance payeeBalance = (Balance) getBalanceDAO().find(transaction.getDestinationAccount());
    payeeBalance.setBalance(payeeBalance.getBalance() > transaction.getTotal() ? payeeBalance.getBalance() -
      transaction.getTotal() : 0);
    getBalanceDAO().put(payeeBalance);
  }


  @Override
  public FObject remove_(X x, FObject fObject) {
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    return super.find_(x, o);
  }
}
