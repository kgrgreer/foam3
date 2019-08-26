package net.nanopay.tx.bmo.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import net.nanopay.tx.bmo.*;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.bmo.eftfile.BmoEftFile;
import net.nanopay.tx.bmo.exceptions.BmoSFTPException;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;


public class BmoSendFileCron implements ContextAgent {

  private static ReentrantLock SEND_LOCK = new ReentrantLock();

  @Override
  public void execute(X x) {

    /**
     * get transactions
     */
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    Predicate condition1 = MLang.OR(
      MLang.INSTANCE_OF(BmoCITransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(BmoCOTransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(BmoVerificationTransaction.getOwnClassInfo())
    );

    Predicate condition2 = MLang.EQ(
      Transaction.STATUS, TransactionStatus.PENDING
    );


    ArraySink sink = (ArraySink) transactionDAO.where(
      MLang.AND(condition1, condition2)
    ).select(new ArraySink());
    ArrayList<Transaction> transactions = (ArrayList<Transaction>) sink.getArray();

    send(x, transactions);
  }

  public void send(X x, List<Transaction> transactions) {
    Logger logger = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));

    // batch record
    List<Transaction> ciTransactions = transactions.stream()
      .filter(transaction -> transaction instanceof CITransaction)
      .collect(Collectors.toList());

    List<Transaction> coTransactions = transactions.stream()
      .filter(transaction -> (transaction instanceof COTransaction || transaction instanceof BmoVerificationTransaction))
      .collect(Collectors.toList());

    logger.info("Sending CI transactions.");
    doEFT(x, ciTransactions);
    logger.info("Finishing send CI transaction.");

    try {
      Thread.sleep(30 * 1000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }

    logger.info("Sending CO transactions.");
    doEFT(x, coTransactions);
    logger.info("Finishing send CO transactions.");
  }

  private void doEFT(X x, List<Transaction> transactions) {
    if ( transactions == null || transactions.isEmpty() ) {
      return;
    }

//    if ( transactions.size() > 1 ) {
//      for ( int i = 1; i < transactions.size(); i++ ) {
//        if ( ! transactions.get(i).getClass().getName().equals(transactions.get(i-1).getClass().getName()) ) {
//          throw new RuntimeException("All transactions should be the same type.");
//        }
//      }
//    }

    BmoSFTPCredential sftpCredential = (BmoSFTPCredential) x.get("bmoSFTPCredential");
    DAO transactionDAO               = (DAO) x.get("localTransactionDAO");
    DAO bmoEftFileDAO                = (DAO) x.get("bmoEftFileDAO");
    Logger logger                    = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));;

    ArrayList<Transaction> passedTransaction = null;
    File readyToSend = null;
    try {
      // boot up
      BmoEftFileGenerator fileGenerator = new BmoEftFileGenerator(x);
      transactions = transactions.stream().map(transaction -> (Transaction)transaction.fclone()).collect(Collectors.toList());

      // 1. init file object
      BmoEftFile eftFile = fileGenerator.initFile(transactions);
      passedTransaction  = fileGenerator.getPassedTransactions();

      // 2. creat the file on the disk
      readyToSend = fileGenerator.createEftFile(eftFile);
      passedTransaction.forEach(transaction -> ((BmoTransaction)transaction).addHistory("Ready to send."));

      // 3. send file through sftp
      if ( ! sftpCredential.getSkipSendFile() ) {

        /* we will need to lock the sending process. We want to make sure only send one file at a time.*/
        SEND_LOCK.lock();

        new BmoSFTPClient(x, sftpCredential).upload(readyToSend);
        passedTransaction.forEach(transaction -> {
          ((BmoTransaction)transaction).addHistory("Sending...");
        });

        /* Fetch and process the receipt file, any exception happened during this process, set the transaction status to Failed */
        try {
          File receipt = new BmoSFTPClient(x, sftpCredential).downloadReceipt();
          passedTransaction.forEach(transaction -> {
            ((BmoTransaction)transaction).addHistory("Downloading receipt...");
          });

          if ( new BmoReportProcessor(x).processReceipt(receipt, eftFile.getHeaderRecord().getFileCreationNumber()) ) {
            passedTransaction.forEach(transaction -> {
              ((BmoTransaction)transaction).addHistory("Verify receipt...");
            });
          } else {
            throw new BmoSFTPException("Failed when verify receipt.");
          }
        } catch ( Exception e ) {
          passedTransaction.forEach(transaction -> {
            ((BmoTransaction)transaction).addHistory("Failed when verify receipt.");
            transaction.setStatus(TransactionStatus.FAILED);
          });
          throw e;
        }

        SEND_LOCK.unlock();
      }

      // 4. update the transaction status
      passedTransaction.forEach(transaction -> {
        ((BmoTransaction)transaction).addHistory("Sent to BMO.");
        ((BmoTransaction)transaction).setBmoFileCreationNumber(eftFile.getHeaderRecord().getFileCreationNumber());
        transaction.setProcessDate(new Date());
        transaction.setStatus(TransactionStatus.SENT);
      });
      bmoEftFileDAO.inX(x).put(eftFile);

    } catch ( Exception e ) {
      logger.error("BMO EFT : " + e.getMessage(), e);
      BmoFormatUtil.sendEmail(x, "BMO EFT Error during sending EFT file", e);
      passedTransaction.forEach(transaction -> ((BmoTransaction)transaction).addHistory("Error: " + e.getMessage()));

      if ( readyToSend != null ) {
        try {
          FileUtils.moveFile(readyToSend, new File(BmoEftFileGenerator.SEND_FAILED +
            readyToSend.getName() + "_" + Instant.now().toEpochMilli()));
        } catch (IOException ex) {
          logger.error("BMO ERROR", e);
        }
      }

    } finally {
      if ( SEND_LOCK.isLocked() ) {
        SEND_LOCK.unlock();
      }
      // update the transaction
      for ( Transaction transaction : transactions ) {

        try {
          transactionDAO.inX(x).put(transaction);
        } catch ( Exception e ) {
          logger.error("Transaction " + transaction.getId() + " updated failed, please update manually", e);
          BmoFormatUtil.sendEmail(x, "Transaction " + transaction.getId() + " updated failed, please update manually", e);
        }

      }
    }
  }

}
