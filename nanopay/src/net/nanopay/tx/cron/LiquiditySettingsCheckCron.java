package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.CashOutFrequency;
import net.nanopay.tx.model.LiquiditySettings;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.List;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;
import static foam.mlang.MLang.OR;

/*
    Cronjob checks Liquidity Settings.
    Does cash in/out depending on user/group Liquidity Settings setup
 */
public class LiquiditySettingsCheckCron implements ContextAgent {
  protected CashOutFrequency frequency_ = CashOutFrequency.PER_TRANSACTION;

  public LiquiditySettingsCheckCron(CashOutFrequency frequency){
    this.frequency_ = frequency;
  }

  @Override
  public void execute(X x) {
    DAO userDAO_              = (DAO) x.get("localUserDAO");
    DAO accountDAO_           = (DAO) x.get("localAccountDAO");
    DAO liquiditySettingsDAO_ = (DAO) x.get("liquiditySettingsDAO");
    DAO transactionDAO_       = (DAO) x.get("localTransactionDAO");
    Logger logger_            = (Logger) x.get("logger");

    List users = ((ArraySink) userDAO_
                  .where(
                         AND(
                             EQ(User.ENABLED, true),
                             EQ(User.SYSTEM, false)
                             )
                         )
                  .select(new ArraySink())).getArray();
    for ( Object u : users ) {
      User user = (User) u;
      Logger logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName(), user.getLegalName()+" ("+user.getId()+")" }, logger_);

      List digitalAccounts = ((ArraySink) accountDAO_
                              .where(
                                     AND(
                                         EQ(Account.OWNER, user.getId()),
                                         EQ(Account.ENABLED, true),
                                         INSTANCE_OF(DigitalAccount.class)
                                         )
                                     )
                              .select(new ArraySink())).getArray();

      for ( Object da : digitalAccounts ) {
        DigitalAccount digital = (DigitalAccount) da;
        Long balance = (Long) digital.findBalance(x);

        LiquiditySettings ls = (LiquiditySettings) liquiditySettingsDAO_.find(digital.getId());
        if ( ls == null  ) {
          Group group = (Group) user.findGroup(x);
          ls = group.getLiquiditySettings();
        }
        if ( ls == null ) {
          continue;
        }

        DAO dao = accountDAO_;
        if ( ls.getBankAccountId() != 0 ) {
          // If explicit other/bank account specified, then ensure it is a verified bank account,
          // or another digital account.
          dao = dao.where(
                          AND(
                              EQ(Account.ID, ls.getBankAccountId()),
                              EQ(Account.OWNER, user.getId()),
                              EQ(Account.ENABLED, true),
                              EQ(Account.DENOMINATION, digital.getDenomination()),
                              OR(
                                 AND(
                                     INSTANCE_OF(BankAccount.class),
                                     EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
                                     ),
                                 INSTANCE_OF(DigitalAccount.class)
                                 )
                              )
                          );
        } else {
          // for group settings find a matching default, same denomination
          // bank account.
          dao = dao.where(
                          AND(
                              INSTANCE_OF(BankAccount.class),
                              EQ(Account.OWNER, user.getId()),
                              EQ(Account.ENABLED, true),
                              EQ(Account.DENOMINATION, digital.getDenomination()),
                              EQ(Account.IS_DEFAULT, true),
                              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
                              )
                          );
        }
        dao = dao.limit(1);
        List accounts = ((ArraySink) dao.select(new ArraySink())).getArray();

        if ( accounts.size() == 1 ) {
          Account account = (Account) accounts.get(0);
          logger.debug("digital", digital, "balance", balance, "account", account, "ls", ls);

          Long pendingCashinAmount = 0L;
          Long pendingCashoutAmount = 0L;

          // Only consider pending Cash-In/Cash-Outs when the liquidity source
          // account is a Bank Account.
          if ( account instanceof BankAccount ) {
            List transactions = ((ArraySink) transactionDAO_
                                 .where(
                                        AND(
                                            OR(
                                               EQ(Transaction.STATUS, TransactionStatus.PENDING),
                                               EQ(Transaction.STATUS, TransactionStatus.PENDING_PARENT_COMPLETED),
                                               EQ(Transaction.STATUS, TransactionStatus.SENT)
                                               ),
                                            INSTANCE_OF(CITransaction.class),
                                            EQ(Transaction.SOURCE_ACCOUNT, account.getId()),
                                            EQ(Transaction.DESTINATION_ACCOUNT, digital.getId())
                                            )
                                        )
                                 .select(new ArraySink())).getArray();


            for ( Object t: transactions) {
              pendingCashinAmount += ((Transaction) t).getDestinationAmount();
            }

            transactions = ((ArraySink) transactionDAO_
                            .where(
                                   AND(
                                       OR(
                                          EQ(Transaction.STATUS, TransactionStatus.PENDING),
                                          EQ(Transaction.STATUS, TransactionStatus.PENDING_PARENT_COMPLETED)
                                          ),
                                       INSTANCE_OF(COTransaction.class),
                                       EQ(Transaction.SOURCE_ACCOUNT, digital.getId()),
                                       EQ(Transaction.DESTINATION_ACCOUNT, account.getId())
                                       )
                                   )
                            .select(new ArraySink())).getArray();

            for ( Object t: transactions) {
              pendingCashoutAmount += ((Transaction) t).getAmount();
            }
          }

          if ( balance - pendingCashoutAmount > ls.getMaximumBalance() &&
               ls.getEnableCashOut() &&
               (ls.getCashOutFrequency() == frequency_ ||
                ls.getCashOutFrequency() == CashOutFrequency.PER_TRANSACTION) ) {
            Long amount = balance - pendingCashoutAmount - ls.getMaximumBalance();
            Transaction txn = addTransaction(x, digital.getId(), account.getId(), amount); // CO
            logger.debug("digital", digital, "balance", balance, "account", account, "txn-co", txn);
          } else if ( balance + pendingCashinAmount < ls.getMinimumBalance() &&
                      ls.getEnableCashIn() &&
                      (ls.getCashOutFrequency() == frequency_ ||
                       ls.getCashOutFrequency() == CashOutFrequency.PER_TRANSACTION) ) {
            Long amount = ls.getMinimumBalance() - balance - pendingCashinAmount;
            Transaction txn = addTransaction(x, account.getId(), digital.getId(), amount); // CI
            logger.debug("digital", digital, "balance", balance, "account", account, "txn-ci", txn);
          }
        }
      }
    }
  }

  public Transaction addTransaction(X x, Long sourceAccountId, Long destinationAccountId, Long amount){
    Transaction transaction = new Transaction.Builder(x)
            .setAmount(amount)
            .setSourceAccount(sourceAccountId)
            .setDestinationAccount(destinationAccountId)
            .build();
    DAO txnDAO = (DAO) x.get("localTransactionDAO");
    try {
      transaction = (Transaction) txnDAO.put_(x, transaction);
    } catch ( RuntimeException e) {
      Logger logger = (Logger) x.get("logger");
      logger.warning(this.getClass().getSimpleName(), "failed liquidity transaction", transaction, e);
      throw e;
    }
    return transaction;
  }
}
