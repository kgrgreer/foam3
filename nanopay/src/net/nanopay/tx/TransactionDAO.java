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
import foam.dao.ProxyDAO;
import foam.dao.ReadOnlyDAO;

import java.util.*;

import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.fx.FXTransaction;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.model.Transaction;


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


  @Override
  public FObject put_(X x, FObject obj) {


    Transaction transaction  = (Transaction) obj;
    Transaction oldTxn;
    oldTxn = (Transaction) getDelegate().find(obj);

    // don't perform balance transfer if status in blacklist

    // REVIEW
    if ( STATUS_BLACKLIST.contains(transaction.getStatus()) && ! ( transaction instanceof DigitalTransaction ) &&
         ! (transaction instanceof COTransaction) ) {
      return super.put_(x, obj);
    }

    return executeTransaction(x, transaction, oldTxn);
  }

  FObject executeTransaction(X x, Transaction t, Transaction oldTxn) {
    Transfer[] ts = t.createTransfers(getX(), oldTxn);

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
      Account account = tr.findAccount(getX());
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
    HashMap<Long, Transfer> hm = new HashMap();

    for ( Transfer tr : ts ) {
      if ( hm.get(tr.getAccount()) != null ) {
        tr.setAmount((hm.get(tr.getAccount())).getAmount() + tr.getAmount());
      }
      hm.put(tr.getAccount(), tr);
    }

    Transfer [] newTs = hm.values().toArray(new Transfer[0]);
    if ( i > ts.length - 1 ) return execute(x, txn, newTs);

    synchronized ( ts[i].getLock() ) {
      return lockAndExecute_(x, txn, newTs, i + 1);
    }
  }

  /** Called once all locks are locked. **/
  FObject execute(X x, Transaction txn, Transfer[] ts) {
    BalanceHistory [] referenceArr = new BalanceHistory[ts.length];
    for ( int i = 0 ; i < ts.length ; i++ ) {
      Transfer t = ts[i];
      Balance balance = (Balance) getBalanceDAO().find(t.getAccount());
      if ( balance == null ) {
        balance = new Balance();
        balance.setId(t.getAccount());
        balance = (Balance) writableBalanceDAO_.put(balance);
      }
      BalanceHistory referenceData = new BalanceHistory.Builder(x)
        .setAccountId(t.getAccount())
        .setUserId(t.findAccount(getX()).getOwner())
        .setBalanceBefore(balance.getBalance())
        .build();
      referenceArr[i] = referenceData;
      try {
        boolean isPendingAcceptFlow = invoiceStatusCheck(x, txn);
        t.findAccount(getX()).validateAmount(x, balance, t.getAmount(), isPendingAcceptFlow);
      } catch (RuntimeException e) {
        if ( txn.getStatus() == TransactionStatus.REVERSE ) {
          txn.setStatus(TransactionStatus.REVERSE_FAIL);
          return super.put_(x, txn);
        }
        throw e;
      }
    }

    for ( int i = 0 ; i < ts.length ; i++ ) {
      Transfer t = ts[i];
      t.validate();
      Balance balance = (Balance) getBalanceDAO().find(t.getAccount());
      t.execute(balance);
      writableBalanceDAO_.put(balance);
      referenceArr[i].setBalanceAfter(balance.getBalance());
    }
    txn.setReferenceData(referenceArr);
    if ( txn instanceof DigitalTransaction ) txn.setStatus(TransactionStatus.COMPLETED);

    return getDelegate().put_(x, txn);
  }

  private boolean invoiceStatusCheck(X x, Transaction txn) {
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    Invoice in = (Invoice) invoiceDAO.find(txn.getInvoiceId());
    return in != null && in.getStatus() == InvoiceStatus.PENDING_ACCEPTANCE;
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
