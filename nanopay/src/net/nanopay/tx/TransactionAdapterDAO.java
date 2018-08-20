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
import foam.util.SafetyUtil;

import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.CompositeTransaction;
import net.nanopay.tx.alterna.AlternaCITransaction;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.alterna.AlternaTransaction;

/**
 * Transform a base Transaction to into more specific type based on Accounts.
 * This decorator should follow Payer/PayeeTransactionDAO.
 */
public class TransactionAdapterDAO
  extends ProxyDAO
{
  public TransactionAdapterDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
  }

  public FObject put_(X x, FObject obj)
    throws RuntimeException {

    // Only concerned with Transactions which are not already a
    // specialized child class.
    if ( ! obj.getClass().equals(Transaction.class) ) {
      return super.put_(x, obj);
    }

    Transaction txn = (Transaction) obj;
    if ( ! SafetyUtil.isEmpty(txn.getId()) ) {
      return super.put_(x, obj);
    }

    Logger logger = (Logger) x.get("logger");

    Account sourceAccount = txn.findSourceAccount(x);
    Account destinationAccount = txn.findDestinationAccount(x);
    if ( sourceAccount == null ||
         destinationAccount == null ) {
      logger.error(this.getClass().getSimpleName(), "source or destination not defined");
      // REVIEW: perhaps notification or just generate error
      return super.put_(x, obj);
    }

    // FIXME: hard-coded for now
    // Future: provide account -> account -> transaction type mapping

    // Cananadian CICO
   /* if ( ( sourceAccount instanceof CABankAccount &&
           destinationAccount instanceof DigitalAccount ) ||
         ( destinationAccount instanceof CABankAccount &&
           sourceAccount instanceof DigitalAccount ) ) {
      AlternaTransaction t = new AlternaTransaction.Builder(x).build();
      t.copyFrom(txn);
      if ( txn.getType() == null ) {
        if ( sourceAccount instanceof CABankAccount && sourceAccount.getOwner() == destinationAccount.getOwner()) {
          t.setType(TransactionType.CASHIN);
        } else if ( sourceAccount instanceof CABankAccount && sourceAccount.getOwner() != destinationAccount.getOwner() ) {
          t.setType(TransactionType.BANK_ACCOUNT_PAYMENT);
        } else {
          t.setType(TransactionType.CASHOUT);
        }
      }
      return super.put_(x, t);
    }*/

    if ( sourceAccount instanceof CABankAccount &&
      destinationAccount instanceof DigitalAccount ) {
      AlternaCITransaction t = new AlternaCITransaction.Builder(x).build();
      t.copyFrom(txn);
      if ( sourceAccount.getOwner() != destinationAccount.getOwner() ) {
        t.setType(TransactionType.BANK_ACCOUNT_PAYMENT);
      } else {
        t.setType(TransactionType.CASHIN);
      }
      return super.put_(x, t);
    } else if ( destinationAccount instanceof CABankAccount &&
      sourceAccount instanceof DigitalAccount ) {
      AlternaCOTransaction t = new AlternaCOTransaction.Builder(x).build();
      t.copyFrom(txn);
      t.setType(TransactionType.CASHOUT);
      return super.put_(x, t);
    }


      // Canadian Bank to Bank
    if ( sourceAccount instanceof CABankAccount &&
         destinationAccount instanceof CABankAccount ) {
      CompositeTransaction composite = new CompositeTransaction.Builder(x).build();
      composite.copyFrom(txn);

      User sourceUser = sourceAccount.findOwner(x);
      User destinationUser = destinationAccount.findOwner(x);
      DigitalAccount destinationDigital = DigitalAccount.findDefault(x, destinationUser, "CAD");

      AlternaTransaction ci = new AlternaTransaction.Builder(x).build();
      ci.copyFrom(txn);
      ci.setDestinationAccount(destinationDigital.getId());
      ci.setPayeeId(destinationUser.getId());
      ci.setType(TransactionType.CASHIN);
      composite.add(x, ci);

      AlternaTransaction co = new AlternaTransaction.Builder(x).build();
      co.copyFrom(txn);
      co.setSourceAccount(destinationDigital.getId());
      co.setPayerId(destinationUser.getId());
      co.setType(TransactionType.CASHOUT);
      composite.add(x,co);

      composite = (CompositeTransaction) super.put_(x, composite);
      composite.next(x);
      return composite;
    }

    // Unsupported - Future DWolla, NAPCO, Indusynd
    if ( sourceAccount instanceof BankAccount ||
         destinationAccount instanceof BankAccount ) {
      throw new RuntimeException("Transaction not supported. non-CABankAccount -> non-CABankAccount ||  non-CABankAccount -> DigitalCash || DigitalCash -> non-CABankAccount");
    }

    // default Digital -> Digital
    return super.put_(x, obj);
  }
}

