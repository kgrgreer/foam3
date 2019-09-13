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

import java.util.*;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.ReadOnlyDAO;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import net.nanopay.account.DebtAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

/**
 * TransactionDAO maintains the memory-only writable BalanceDAO,
 * and performs all put operations.
 * ReadOnly access is provided via getBalanceDAO. see LocalBalanceDAO
 */
public class TransactionDAO
  extends ProxyDAO
{
  protected DAO balanceDAO_;
  protected DAO userDAO_;
  private   DAO writableBalanceDAO_ = initWriteableBalanceDAO_();
  private final DAO initWriteableBalanceDAO_() {
    foam.dao.MDAO d = new foam.dao.MutableMDAO(Balance.getOwnClassInfo());
    d.addIndex(Balance.ACCOUNT);
    return d;
  }

  public TransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public TransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }


  protected DAO getBalanceDAO() {
    if ( balanceDAO_ == null ) {
      balanceDAO_ = new ReadOnlyDAO.Builder(getX()).setDelegate(new foam.dao.FreezingDAO(getX(), writableBalanceDAO_)).build();
    }
    return balanceDAO_;
  }


  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn    = (Transaction) obj;
    Transaction oldTxn = (Transaction) getDelegate().find_(x, obj);

    if ( canExecute(x, txn, oldTxn) ) {
      txn = (Transaction) executeTransaction(x, txn, oldTxn);
    } else {
      txn = (Transaction) super.put_(x, txn);
    }

    return txn;
  }

  /**
   * return true when status change is such that Transfers should be executed (applied)
   */
  boolean canExecute(X x, Transaction txn, Transaction oldTxn) {
    return ( ! SafetyUtil.isEmpty(txn.getId()) ||
             txn instanceof DigitalTransaction ) &&
      (txn.getNext() == null || txn.getNext().length == 0 ) &&
      (txn.canTransfer(x, oldTxn) ||
       txn.canReverseTransfer(x, oldTxn));
  }

  FObject executeTransaction(X x, Transaction txn, Transaction oldTxn) {
    X y = getX().put("balanceDAO",getBalanceDAO());
    Transfer[] ts = txn.createTransfers(y, oldTxn);

    // TODO: disallow or merge duplicate accounts
    if ( ts.length != 1 ) {
      validateTransfers(x, txn, ts);
    }
    return lockAndExecute(x, txn, ts, 0);
  }

  void validateTransfers(X x, Transaction txn, Transfer[] ts)
    throws RuntimeException
  {
    HashMap hm = new HashMap();
    Logger logger = (Logger) x.get("logger");
    for ( Transfer tr : ts ) {
      tr.validate();
      Account account = tr.findAccount(getX());
      if ( account == null ) {
        logger.error("Unknown account: " + tr.getAccount(), tr);
        throw new RuntimeException("Unknown account: " + tr.getAccount());
      }
      account.validateAmount(x, (Balance) getBalanceDAO().find(account.getId()), tr.getAmount());
      if ( ! (account instanceof DebtAccount) )
        hm.put(account.getDenomination(), (hm.get(account.getDenomination()) == null ? 0 : (Long) hm.get(account.getDenomination())) + tr.getAmount());
    }

    for ( Object value : hm.values() ) {
      if ( (long)value != 0 ) {
        logger.error("Debits and credits don't match.", value);
        throw new RuntimeException("Debits and credits don't match.");
      }
    }
  }

  /** Sorts array of transfers. **/
  FObject lockAndExecute(X x, Transaction txn, Transfer[] ts, int i) {
    // sort to avoid deadlock
    java.util.Arrays.sort(ts);

    return lockAndExecute_(x, txn, ts, i);
  }

  /** Lock each transfer's account then execute the transfers. **/
  FObject lockAndExecute_(X x, Transaction txn, Transfer[] ts, int i) {
    HashMap<Long, Transfer> hm = new HashMap();

    for ( Transfer tr : ts ) {
      if ( hm.get(tr.getAccount()) != null ) {
        tr.setAmount((hm.get(tr.getAccount())).getAmount() + tr.getAmount());
      }
      hm.put(tr.getAccount(), tr);
    }

    Transfer [] newTs = hm.values().toArray(new Transfer[0]);
    if ( i > ts.length - 1 ) {
      return execute(x, txn, newTs);
    }

    synchronized ( ts[i].getLock() ) {
      return lockAndExecute_(x, txn, newTs, i + 1);
    }
  }

  /** Called once all locks are locked. **/
  FObject execute(X x, Transaction txn, Transfer[] ts) {
    Balance [] finalBalanceArr = new Balance[ts.length];
    DAO localAccountDAO = (DAO) x.get("localAccountDAO");
    for ( int i = 0 ; i < ts.length ; i++ ) {
      Transfer t = ts[i];
      Account account = (Account) localAccountDAO.find(t.getAccount());
      Balance balance = (Balance) writableBalanceDAO_.find(account.getId());
      if ( balance == null ) {
        balance = new Balance();
        balance.setId(account.getId());
        balance = (Balance) writableBalanceDAO_.put(balance);
      }
      finalBalanceArr[i] = balance;
      try {
        account.validateAmount(x, balance, t.getAmount());
      } catch (RuntimeException e) {
        if ( txn.getStatus() == TransactionStatus.REVERSE ) {
          txn.setStatus(TransactionStatus.REVERSE_FAIL);
          return super.put_(x, txn);
        }
        ((Logger) x.get("logger")).error(" Failed to validate amount for account " + account.getId(), e);
        throw e;
      }
    }

    for ( int i = 0 ; i < ts.length ; i++ ) {
      Transfer t = ts[i];
      t.validate();
      Balance balance = finalBalanceArr[i];
      t.execute(balance);
      finalBalanceArr[i] = (Balance) balance.fclone();
    }
    txn.setBalances(finalBalanceArr);

    return getDelegate().put_(x, txn);
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
