package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import foam.nanos.auth.User;
import java.util.Date;
import java.util.List;
import net.nanopay.model.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import static foam.mlang.MLang.*;

public class TransactionDAO
    extends ProxyDAO
{
  protected DAO userDAO_;
  protected DAO accountDAO_;
  protected DAO invoiceDAO_;

  public TransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public TransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) {
      userDAO_ = (DAO) getX().get("localUserDAO");
    }
    return userDAO_;
  }

  protected DAO getInvoiceDAO() {
    if ( invoiceDAO_ == null ) {
      invoiceDAO_ = (DAO) getX().get("invoiceDAO");
    }
    return invoiceDAO_;
  }

  protected DAO getAccountDAO() {
    if ( accountDAO_ == null ) {
      accountDAO_ = (DAO) getX().get("localAccountDAO");
    }
    return accountDAO_;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    System.out.println("beginning ORDINARY TransactionDAO done");
    Transaction transaction = (Transaction) obj;
    transaction.setDate(new Date());

    long payeeId = transaction.getPayeeId();
    long payerId = transaction.getPayerId();
    System.out.println("-1-1-1-1-1-1-1-1-1-1-1 ORDINARY TransactionDAO before synchronized");
    if (payerId <= 0) {
      System.out.println("if (payerId <= 0) {");
      throw new RuntimeException("Invalid Payer id");
    }

    if (payeeId <= 0) {
      System.out.println("if (payeeId <= 0) {");
      throw new RuntimeException("Invalid Payee id");
    }

    if ( payeeId == payerId && !( ((TransactionType)transaction.getType()) != TransactionType.CASHOUT || ((TransactionType)transaction.getType()) != TransactionType.CASHIN ) ) {
      System.out.println("if (payeeId == payerId) {");
      System.out.println("transaction.getType():"+transaction.getType());

      throw new RuntimeException("PayeeID and PayerID cannot be the same");
    }

    if (transaction.getTotal() <= 0) {
      System.out.println("if (transaction.getTotal() <= 0) {");
      throw new RuntimeException("Transaction amount must be greater than 0");
    }
    System.out.println("0000 ORDINARY TransactionDAO before synchronized");
    Long firstLock = payerId < payeeId ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = payerId > payeeId ? transaction.getPayerId() : transaction.getPayeeId();
    System.out.println("1111 ORDINARY TransactionDAO before synchronized");
    synchronized (firstLock) {
      synchronized (secondLock) {
        Sink sink;
        List data;
        Account payeeAccount;
        Account payerAccount;
        User payee = (User) getUserDAO().find(transaction.getPayeeId());
        User payer = (User) getUserDAO().find(transaction.getPayerId());
        System.out.println("00000 ORDINARY TransactionDAO before validations synchronized");
        if (payee == null || payer == null) {
          throw new RuntimeException("Users not found");
        }
        System.out.println("11111 ORDINARY TransactionDAO before validations synchronized");
        // find payee account
        payeeAccount = (Account) getAccountDAO().find(payee.getId());
        if ( payeeAccount == null ) {
          throw new RuntimeException("Payee account not found");
        }
        System.out.println("222222 ORDINARY TransactionDAO before validations synchronized");
        // find payer account
        payerAccount = (Account) getAccountDAO().find(payer.getId());
        if ( payerAccount == null ) {
          throw new RuntimeException("Payer account not found");
        }
        System.out.println("33333 ORDINARY TransactionDAO before validations synchronized");
        System.out.println("payer account ID:"+payerAccount.getId());
        System.out.println("payer account balance:"+payerAccount.getBalance());
        System.out.println("payee account ID:"+payeeAccount.getId());
        System.out.println("payee account balance:"+payeeAccount.getBalance());
        System.out.println("33333 ORDINARY TransactionDAO before validations synchronized");
        // check if payer account has enough balance
        long total = transaction.getTotal();
        System.out.println("4444444 ORDINARY TransactionDAO after validations synchronized");
          //For cash in, just increment balance, payer and payee will be the same
         if ( ((TransactionType)transaction.getType()) == TransactionType.CASHIN ) {
          System.out.println("4-1 cashin");
           payerAccount.setBalance(payerAccount.getBalance() + total);
         }
         else if ( ((TransactionType)transaction.getType()) == TransactionType.CASHOUT ) {
           //For cash out, decrement balance, payer and payee will be the same
          System.out.println("4-1 cashout");
           payerAccount.setBalance(payerAccount.getBalance() - total);
         }
         else {
           payerAccount.setBalance(payerAccount.getBalance() - total);
           payeeAccount.setBalance(payeeAccount.getBalance() + total);
         }
         System.out.println("5555");
        // find invoice
        if ( transaction.getInvoiceId() != 0 ) {
          Invoice invoice = (Invoice) getInvoiceDAO().find(transaction.getInvoiceId());
          if ( invoice == null ) {
            throw new RuntimeException("Invoice not found");
          }

          invoice.setPaymentId(transaction.getId());
          invoice.setPaymentDate(transaction.getDate());
          invoice.setPaymentMethod(PaymentStatus.CHEQUE);
          getInvoiceDAO().put(invoice);
        }
        System.out.println("returning TransactionDAO done");
        return super.put_(x, obj);
      }
    }
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
