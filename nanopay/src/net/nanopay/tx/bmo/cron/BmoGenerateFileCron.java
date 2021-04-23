package net.nanopay.tx.bmo.cron;

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
import net.nanopay.tx.bmo.BmoEftFileGenerator;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.bmo.eftfile.BmoEftFile;
import net.nanopay.tx.bmo.exceptions.BmoEftFileException;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class BmoGenerateFileCron implements ContextAgent {
  String spid;

  public BmoGenerateFileCron(String spid) {
    this.spid = spid;
  }

  @Override
  public void execute(X x) {

    /**
     * get transactions
     */
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    Predicate condition1 = MLang.OR(
      MLang.AND(
        MLang.INSTANCE_OF(BmoCITransaction.getOwnClassInfo()),
        MLang.EQ(BmoCITransaction.SETTLED, false)
      ),
      MLang.AND(
        MLang.INSTANCE_OF(BmoCOTransaction.getOwnClassInfo()),
        MLang.EQ(BmoCOTransaction.SETTLED, false)
      ),
      MLang.AND(
        MLang.INSTANCE_OF(BmoVerificationTransaction.getOwnClassInfo()),
        MLang.EQ(BmoVerificationTransaction.SETTLED, false)
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

    Logger logger = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));

    try {

      transactions = transactions.stream().map(transaction -> (Transaction)transaction.fclone()).collect(Collectors.toList());

      logger.info("Generating EFT file for CI transactions.");

      List<Transaction> ciTransactions = transactions.stream()
        .filter(transaction -> transaction instanceof CITransaction)
        .collect(Collectors.toList());

      generateFile(x, ciTransactions, spid);

      logger.info("Generating EFT File for CO transactions.");

      List<Transaction> coTransactions = transactions.stream()
        .filter(transaction -> (transaction instanceof COTransaction || transaction instanceof BmoVerificationTransaction))
        .collect(Collectors.toList());

      generateFile(x, coTransactions, spid);

    } catch ( Exception e ) {
      String msg = "BMO EFT File Generation Failed : " + e.getMessage();
      logger.error(msg, e);
      BmoFormatUtil.sendEmail(x, msg, e);
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

    Logger logger = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));
    BmoEftFileGenerator fileGenerator = new BmoEftFileGenerator(x);
    try {
      BmoEftFile eftFile = (BmoEftFile) fileGenerator.generate(transactions, spid);
      if ( eftFile == null ) throw new RuntimeException("Generated EFT File was null");
      ArrayList<Transaction> passedTransaction  = fileGenerator.getPassedTransactions();

      try {
        passedTransaction.forEach(transaction -> {
          transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("BMO EFT File Generated.").build());
        });
        updateTransaction(x, passedTransaction, eftFile);
        eftFile.setStatus(EFTFileStatus.GENERATED);
        eftFile.setSpid(spid);
        ((DAO) x.get("bmoEftFileDAO")).put(eftFile);
      } catch ( Exception e ) {
        logger.error("BMO Batch Error while updating transaction: " + e.getMessage(), e);
        BmoFormatUtil.sendEmail(x, "BMO Batch Error while updating transaction: " + e.getMessage(), e);
      }
    } catch ( Exception e ) {
      logger.error("BMO Batch File Generation Error : " + e.getMessage(), e);
      BmoFormatUtil.sendEmail(x, "BMO EFT Error generating EFT File.", e);
    }
  }

  protected void updateTransaction(X x, List<Transaction> transactions, BmoEftFile eftFile) {
    Logger logger = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));
    for ( Transaction transaction : transactions ) {
      try {
        ((BmoTransaction)transaction).setBmoFileCreationNumber(eftFile.getHeaderRecord().getFileCreationNumber());
        transaction.setProcessDate(new Date());
        transaction.setStatus(TransactionStatus.SENT);
        ((DAO) x.get("localTransactionDAO")).put(transaction);
      } catch ( Exception e ) {
        String msg = "BMO Batch Error while updating transaction: " + transaction.getId() + " with error: " + e.getMessage();
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

}
