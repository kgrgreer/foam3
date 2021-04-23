package net.nanopay.tx.rbc.cron;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.notification.Notification;
import net.nanopay.tx.TransactionEvent;
import net.nanopay.tx.rbc.RBCEFTFileGenerator;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.rbc.RbcCITransaction;
import net.nanopay.tx.rbc.RbcCOTransaction;
import net.nanopay.tx.rbc.RbcTransaction;
import net.nanopay.tx.rbc.RbcVerificationTransaction;
import net.nanopay.tx.rbc.exceptions.RbcEftFileException;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class RbcGenerateFileCron implements ContextAgent {
  String spid;
  long eftLimit = 100000000;

  public RbcGenerateFileCron(String spid) {
    this.spid = spid;
  }

  public RbcGenerateFileCron(String spid, long eftLimit) {
    this.spid = spid;
    this.eftLimit = eftLimit;
  }

  @Override
  public void execute(X x) {
    /**
     * get transactions
     */
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    Predicate condition1 = MLang.OR(
      MLang.AND(
        MLang.INSTANCE_OF(RbcCITransaction.getOwnClassInfo()),
        MLang.EQ(RbcCITransaction.SETTLED, false)
      ),
      MLang.AND(
        MLang.INSTANCE_OF(RbcCOTransaction.getOwnClassInfo()),
        MLang.EQ(RbcCOTransaction.SETTLED, false)
      ),
      MLang.AND(
        MLang.INSTANCE_OF(RbcVerificationTransaction.getOwnClassInfo()),
        MLang.EQ(RbcVerificationTransaction.SETTLED, false)
      )
    );

    Predicate condition2 = MLang.EQ(
      Transaction.STATUS, TransactionStatus.PENDING
    );

    Predicate condition3 = MLang.EQ(
      Transaction.SPID, spid
    );

    ArraySink sink = (ArraySink) transactionDAO.where(
      MLang.AND(condition1, condition2, condition3)
    ).select(new ArraySink());
    ArrayList<Transaction> transactions = (ArrayList<Transaction>) sink.getArray();

    generate(x, transactions, spid);
  }

  public void generate(X x, List<Transaction> transactions, String spid) {
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    try {
      transactions = transactions.stream().map(transaction -> (Transaction)transaction.fclone()).collect(Collectors.toList());

      logger.info("Generating EFT file for CI transactions.");

      List<Transaction> ciTransactions = transactions.stream()
        .filter(transaction -> transaction instanceof CITransaction)
        .collect(Collectors.toList());

      generateFile(x, eftLimitTransactions(x, ciTransactions), spid);

      logger.info("Generating EFT File for CO transactions.");

      List<Transaction> coTransactions = transactions.stream()
        .filter(transaction -> (transaction instanceof COTransaction || transaction instanceof RbcVerificationTransaction))
        .collect(Collectors.toList());

      generateFile(x, eftLimitTransactions(x, coTransactions), spid);

    } catch ( Exception e ) {
      String msg = "RBC EFT File Generation Failed : " + e.getMessage();
      logger.error(msg, e);
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody(msg)
        .build();
      ((DAO) x.get("localNotificationDAO")).put(notification);
    }
  }

  protected void generateFile(X x, List<Transaction> transactions, String spid) {
    if ( transactions == null || transactions.isEmpty() ) {
      return;
    }

    RBCEFTFileGenerator fileGenerator = new RBCEFTFileGenerator(x);
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    try {
      EFTFile eftFile = (EFTFile) fileGenerator.generate(transactions, spid);
      if ( eftFile == null ) throw new RuntimeException("Generated EFT File was null");
      ArrayList<Transaction> passedTransaction  = fileGenerator.getPassedTransactions();

      try {
        passedTransaction.forEach(transaction -> {
          transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("RBC EFT File Generated.").build());
        });
        updateTransaction(x, passedTransaction, eftFile);
        eftFile.setStatus(EFTFileStatus.GENERATED);
        eftFile.setSpid(spid);
        ((DAO) x.get("eftFileDAO")).put(eftFile);
      } catch ( Exception e ) {
        logger.error("RBC Batch Error while updating transaction: " + e.getMessage(), e);
        BmoFormatUtil.sendEmail(x, "RBC Batch Error while updating transaction: " + e.getMessage(), e);
      }
    } catch ( Exception e ) {
      logger.error("RBC Batch File Generation Error : " + e.getMessage(), e);
      BmoFormatUtil.sendEmail(x, "RBC EFT Error generating EFT File.", e);
    }
  }

  protected void updateTransaction(X x, List<Transaction> transactions, EFTFile eftFile) {
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    for ( Transaction transaction : transactions ) {
      try {
        ((RbcTransaction)transaction).setRbcFileCreationNumber(eftFile.getId());
        transaction.setProcessDate(new Date());
        transaction.setStatus(TransactionStatus.SENT);
        ((DAO) x.get("localTransactionDAO")).put(transaction);
      } catch ( Exception e ) {
        String msg = "RBC Batch Error while updating transaction: " + transaction.getId() + " with error: " + e.getMessage();
        logger.error(msg, e);
        BmoFormatUtil.sendEmail(x, msg, e);
        Notification notification = new Notification.Builder(x)
          .setTemplate("NOC")
          .setBody(msg)
          .build();
        ((DAO) x.get("localNotificationDAO")).put(notification);
      }
    }
  }

  protected List<Transaction> eftLimitTransactions(X x, List<Transaction> transactions) {
    List<Transaction> limitedTransactions = new ArrayList<>();
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    long cumulativeAmount = 0;
    for ( int i = 0; i < transactions.size(); i++ ) {
      Transaction txn = (Transaction) transactions.get(i);
      cumulativeAmount -= txn.getTotal(x, txn.getSourceAccount());
      if ( cumulativeAmount >= eftLimit ) {
        int leftoverTxns = transactions.size() - i;
        logger.warning("RBC EFT limit of " + eftLimit + " was reached with " + leftoverTxns + " transactions remaining for next EFT file.");
        break;
      }
      limitedTransactions.add(txn);
    }
    return limitedTransactions;
  }

}
