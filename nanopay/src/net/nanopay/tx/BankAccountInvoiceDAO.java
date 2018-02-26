package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class BankAccountInvoiceDAO extends ProxyDAO {
    protected DAO userDAO_;
    protected DAO accountDAO_;
    protected DAO bankAccountDAO_;
    protected DAO invoiceDAO_;

    public BankAccountInvoiceDAO(X x, DAO delegate) {
        setDelegate(delegate);
        setX(x);
        // initialize our DAO
        userDAO_ = (DAO) x.get("localUserDAO");
        invoiceDAO_ = (DAO) x.get("invoiceDAO");
        accountDAO_ = (DAO) x.get("localAccountDAO");
        bankAccountDAO_ = (DAO) x.get("localBankAccountDAO");
    }

    @Override
    synchronized public FObject put_(X x, FObject obj) {
        // If It is a CICO Transaction, does not do anything.
        Transaction txn = (Transaction) obj;
        if ( txn.getPayeeId() == txn.getPayerId() ) {
            return super.put_(x, obj);
        }
        Invoice invoice = (Invoice) invoiceDAO_.find(txn.getInvoiceId());
        //invoice.getPaymentMethod();
        Account payerAccount = (Account) accountDAO_.find(invoice.getPayerId());
        long payerId = payerAccount.getId();
        User payer = (User) userDAO_.find(payerId);
        long amount = txn.getAmount();
        BankAccount bankAccount = (BankAccount) bankAccountDAO_.find(txn.getBankAccountId());
        if ( bankAccount != null ) {
            addCashIn(x, payerId, amount, bankAccount);
        }

        return getDelegate().put_(x, obj);
    }


    public void addCashIn(X x, long userId, long amount, BankAccount bankAccount){
        Transaction transaction = new Transaction.Builder(x)
                .setPayeeId(userId)
                .setPayerId(userId)
                .setAmount(amount)
                .setType(TransactionType.CASHIN)
                .setBankAccountId(bankAccount.getId())
                .build();
        DAO txnDAO = (DAO) x.get("transactionDAO");
        txnDAO.put_(x, transaction);

    }
}
