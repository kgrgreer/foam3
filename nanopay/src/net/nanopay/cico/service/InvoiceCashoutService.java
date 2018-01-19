package net.nanopay.cico.service;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.pm.PM;
import java.io.IOException;
import net.nanopay.model.BankAccount;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.dao.ListSink;
import foam.dao.Sink;
import foam.mlang.MLang;
import java.util.Date;
import java.util.List;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.cico.model.TransactionStatus;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.model.Account;
import net.nanopay.tx.model.Transaction;

public class InvoiceCashoutService
    extends    ContextAwareSupport
    implements InvoiceCashoutInterface
{
  protected DAO bankAccountDAO;
  protected DAO standardCICOTransactionDAO;
  protected DAO userDAO;

  @Override
  public boolean addCashout(FObject obj)
      throws RuntimeException
  {

    Transaction transaction = (Transaction) obj;
    long payeeId = transaction.getPayeeId();
    long payerId = transaction.getPayerId();
    User payee = (User) userDAO.find(transaction.getPayeeId());
    long total = transaction.getTotal();
    payee.setX(getX());

    Sink sinkBank = new ListSink();
    sinkBank = bankAccountDAO.inX(getX()).where(MLang.EQ(BankAccount.OWNER, payee.getId())).limit(1).select(sinkBank);

    List dataBank = ((ListSink) sinkBank).getData();
    BankAccount bankAccountPayee = (BankAccount) dataBank.get(0);

    // Cashout invoice payee
    Transaction t = new Transaction();
    t.setPayeeId(payeeId);
    t.setPayerId(payeeId);
    t.setBankAccountId(bankAccountPayee.getId());
    t.setInvoiceId(0);
    t.setAmount(total);
    t.setDate(new Date());

    standardCICOTransactionDAO.put(t);
    return true;

  }

  @Override
  public void start() {
    standardCICOTransactionDAO = (DAO) getX().get("standardCICOTransactionDAO");
    bankAccountDAO = (DAO) getX().get("localBankAccountDAO");
    userDAO = (DAO) getX().get("localUserDAO");
  }
}
