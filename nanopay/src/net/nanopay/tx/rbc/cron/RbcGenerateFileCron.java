/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.tx.rbc.cron;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import foam.nanos.alarming.Alarm;
import foam.log.LogLevel;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.notification.Notification;
import net.nanopay.tx.TransactionEvent;
import net.nanopay.tx.rbc.RBCEFTFileGenerator;
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
import static foam.mlang.MLang.*;

public class RbcGenerateFileCron implements ContextAgent {
  protected String spid;
  protected long eftLimit = 100000000;
  protected boolean createDebits = true;
  protected boolean createCredits = true;

  public RbcGenerateFileCron(String spid) {
    this.spid = spid;
  }

  public RbcGenerateFileCron(String spid, long eftLimit) {
    this.spid = spid;
    this.eftLimit = eftLimit;
  }

  public RbcGenerateFileCron(String spid, boolean createDebits, boolean createCredits) {
    this.spid = spid;
    this.createDebits = createDebits;
    this.createCredits = createCredits;
  }

  public RbcGenerateFileCron(String spid, long eftLimit, boolean createDebits, boolean createCredits) {
    this.spid = spid;
    this.eftLimit = eftLimit;
    this.createDebits = createDebits;
    this.createCredits = createCredits;
  }

  @Override
  public void execute(X x) {
    /**
     * get transactions
     */
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    try {
      DAO transactionDAO = (DAO) x.get("localTransactionDAO");

      Predicate condition1 = OR(
        AND(
          INSTANCE_OF(RbcCITransaction.getOwnClassInfo()),
          EQ(RbcCITransaction.SETTLED, false)
        ),
        AND(
          INSTANCE_OF(RbcCOTransaction.getOwnClassInfo()),
          EQ(RbcCOTransaction.SETTLED, false)
        ),
        AND(
          INSTANCE_OF(RbcVerificationTransaction.getOwnClassInfo()),
          EQ(RbcVerificationTransaction.SETTLED, false)
        )
      );

      Predicate condition2 = EQ(
        Transaction.STATUS, TransactionStatus.PENDING
      );

      Predicate condition3 = EQ(
        Transaction.SPID, spid
      );

      ArraySink sink = (ArraySink) transactionDAO.where(
        AND(condition1, condition2, condition3)
      ).select(new ArraySink());
      ArrayList<Transaction> transactions = (ArrayList<Transaction>) sink.getArray();

      generate(x, transactions, spid);
    } catch (Exception e) {
      DAO alarmDAO = (DAO) x.get("alarmDAO");
      String name = "RbcGenerateFileCron-Status";
      String note = "RbcGenerateFileCron Exception: " + e.getMessage();
      Alarm alarm = new Alarm(name, note, LogLevel.ERROR);
      alarmDAO.put(alarm);
      logger.error(name, e);
    }
  }

  public void generate(X x, List<Transaction> transactions, String spid) {
    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    try {
      transactions = transactions.stream().map(transaction -> (Transaction)transaction.fclone()).collect(Collectors.toList());

      if ( createDebits ) {
        logger.info("Generating EFT file for CI transactions.");
        List<Transaction> ciTransactions = transactions.stream()
          .filter(transaction -> transaction instanceof CITransaction)
          .collect(Collectors.toList());
        generateFile(x, eftLimitTransactions(x, ciTransactions), spid);
      }

      if ( createCredits ) {
        logger.info("Generating EFT File for CO transactions.");
        List<Transaction> coTransactions = transactions.stream()
          .filter(transaction -> (transaction instanceof COTransaction || transaction instanceof RbcVerificationTransaction))
          .collect(Collectors.toList());
        generateFile(x, eftLimitTransactions(x, coTransactions), spid);
      }
    } catch ( Exception e ) {
      DAO alarmDAO = (DAO) x.get("alarmDAO");
      String name = "RBCGenerateFileCron-Generate";
      String note = "RBC EFT File Generation Failed : " + e.getMessage();
      Alarm alarm = new Alarm(name, note, LogLevel.ERROR);
      alarmDAO.put(alarm);
      logger.error(name, e);
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
        DAO alarmDAO = (DAO) x.get("alarmDAO");
        String name = "RbcBatchTransactionError-Status";
        String note = "RBC Batch Error while updating transaction: " + e.getMessage();
        Alarm alarm = new Alarm(name, note, LogLevel.ERROR);
        alarmDAO.put(alarm);
        logger.error(name, e);
      }
    } catch ( Exception e ) {
      DAO alarmDAO = (DAO) x.get("alarmDAO");
      String name = "RbcEFTFileError-Status";
      String note = "RBC EFT Error generating EFT File: " + e.getMessage();
      Alarm alarm = new Alarm(name, note, LogLevel.ERROR);
      alarmDAO.put(alarm);
      logger.error(name, e);
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
        DAO alarmDAO = (DAO) x.get("alarmDAO");
        String name = "RbcBatchTransactionError-Status";
        String note = "RBC Batch Error while updating transaction: " + e.getMessage();
        Alarm alarm = new Alarm(name, note, LogLevel.ERROR);
        alarmDAO.put(alarm);
        logger.error(name, e);
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
