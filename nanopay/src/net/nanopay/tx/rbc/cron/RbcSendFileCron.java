package net.nanopay.tx.rbc.cron;

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

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.locks.ReentrantLock;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.rbc.exceptions.RbcFTPSException;
import net.nanopay.tx.rbc.ftps.RbcFTPSClient;
import net.nanopay.tx.rbc.iso20022file.RbcBatchRecord;
import net.nanopay.tx.rbc.iso20022file.RbcCIRecord;
import net.nanopay.tx.rbc.iso20022file.RbcCORecord;
import net.nanopay.tx.rbc.iso20022file.RbcRecord;
import net.nanopay.tx.rbc.RBCEFTFileGenerator;
import net.nanopay.tx.rbc.RbcCITransaction;
import net.nanopay.tx.rbc.RbcCOTransaction;
import net.nanopay.tx.rbc.RbcPGPUtil;
import net.nanopay.tx.rbc.RbcReportProcessor;
import net.nanopay.tx.rbc.RbcTransaction;
import net.nanopay.tx.rbc.RbcVerificationTransaction;
import net.nanopay.tx.TransactionEvent;
import org.apache.commons.io.FileUtils;


public class RbcSendFileCron implements ContextAgent {

  protected static ReentrantLock SEND_LOCK = new ReentrantLock();
  protected RbcFTPSClient rbcFTPSClient;
  protected Logger logger;

  @Override
  public void execute(X x) {

    rbcFTPSClient = new RbcFTPSClient(x);

    /**
     * get transactions
     */
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

    Predicate condition1 = MLang.OR(
      MLang.INSTANCE_OF(RbcCITransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(RbcCOTransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(RbcVerificationTransaction.getOwnClassInfo())
    );

    Predicate condition2 = MLang.EQ(
      Transaction.STATUS, TransactionStatus.PENDING
    );

    ArraySink sink = (ArraySink) transactionDAO.where(
      MLang.AND(condition1, condition2)
    ).select(new ArraySink());
    List<Transaction> transactions = (ArrayList<Transaction>) sink.getArray();
    List<Transaction> processedTransactions = new ArrayList<>();

    try{
      transactions = transactions.stream().map(transaction -> (Transaction)transaction.fclone()).collect(Collectors.toList());
      RBCEFTFileGenerator generator = new RBCEFTFileGenerator(x);
      // Get Batch Records
      RbcBatchRecord batch = null;
      try {
        logger.info("transactions count after clone " + transactions.size());
        batch = generator.createBatch(transactions);
      } catch ( Exception e ) {
        logger.error("RBC Batch Error : " + e.getMessage(), e);
        BmoFormatUtil.sendEmail(x, "RBC EFT Error creating ISO20022 Batch files.", e); // TODO
      }
      
      if ( batch != null ) {
        // Process CI Transactions
        List<Transaction> processedCITransactions = null;
        try{
          processedCITransactions = processRecords(x, batch.getCiRecords());
          processedTransactions.addAll(processedCITransactions);
        } catch ( Exception e ) {
          logger.error("RBC CI Transaction Records : " + e.getMessage(), e);
          BmoFormatUtil.sendEmail(x, "RBC Error processing CITransaction records.", e); // TODO
        }

        logger.info("Finishing send CI transaction.");
        try {
          Thread.sleep(30 * 1000);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }

        // Process CO Transactions
        logger.info("processing CO transactions.");
        List<Transaction> processedCOTransactions = null;
        try{
          processedCOTransactions = processRecords(x, batch.getCoRecords());
          processedTransactions.addAll(processedCOTransactions);
        } catch ( Exception e ) {
          logger.error("RBC CO Transaction Records : " + e.getMessage(), e);
          BmoFormatUtil.sendEmail(x, "RBC Error processing COTransaction records.", e); // TODO
        }
        logger.info("Finishing send CO transaction.");
      }
    } catch ( Exception e ) {
      logger.error("RBC ISO20022 : " + e.getMessage(), e);
      BmoFormatUtil.sendEmail(x, "RBC EFT Error creating ISO20022 Batch files.", e);
    } finally {
      if ( SEND_LOCK.isLocked() ) {
        SEND_LOCK.unlock();
      }
      
      // update the transaction
      for ( Transaction transaction : processedTransactions ) {
        try {
          transactionDAO.inX(x).put(transaction);
        } catch ( Exception e ) {
          logger.error("Transaction " + transaction.getId() + " updated failed, please update manually", e);
          BmoFormatUtil.sendEmail(x, "Transaction " + transaction.getId() + " updated failed, please update manually", e); // TODO
        }
      }
    }
  }

  protected List<Transaction> processRecords(X x, RbcRecord records) {
    RBCEFTFileGenerator generator = new RBCEFTFileGenerator(x);
    File readyToSend = null;
    List<Transaction> processedTransactions = new ArrayList<>();
    try{
      if ( records == null ) throw new Exception("No records found..");
      processedTransactions = Arrays.asList(records.getTransactions());
      try{
        readyToSend = generator.createEncryptedFile(generator.createFile(records.getFile()));
        if ( readyToSend != null ) {
          processedTransactions = send(x, readyToSend, processedTransactions, records.getFile());
        }
      } catch ( Exception e ) {
        processedTransactions.forEach(transaction -> {
            transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Error: " + e.getMessage()).build());
            transaction.setStatus(TransactionStatus.FAILED);
          });
        throw e;
      }  
    } catch ( Exception e ) {
      logger.error("RBC Transaction Record Error : " + e.getMessage(), e);
      BmoFormatUtil.sendEmail(x, "RBC ISO20022 Error during sending file", e); // TODO

      if ( readyToSend != null ) {
        try {
          FileUtils.moveFile(readyToSend, new File(RBCEFTFileGenerator.SEND_FAILED +
            readyToSend.getName() + "_" + Instant.now().toEpochMilli()));
        } catch (IOException ex) {
          logger.error("RBC CI Transactions ERROR", e);
        }
      }
    } finally {
      if ( SEND_LOCK.isLocked() ) {
        SEND_LOCK.unlock();
      }

      if ( records != null ) {
        // Add transactions that failed to be added to records so we can update them to failed later
        processedTransactions.addAll(Arrays.asList(records.getFailedTransactions()));
      }
    }
    return processedTransactions;
  }

  protected List<Transaction> send(X x, File file, List<Transaction> processedTransactions, long fileId) {
    try{
      processedTransactions.forEach(transaction -> transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Ready to send.").build()));
                    
      /* we will need to lock the sending process. We want to make sure only send one file at a time.*/
      SEND_LOCK.lock();

      /* Sending file to RBC */
      try{
        rbcFTPSClient.send(file);
        processedTransactions.forEach(transaction -> {
          transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Sending...").build());
        });
      } catch ( Exception e ) {
        throw new RbcFTPSException("Failed sending file via FTPS.");
      }
    
      /* Fetch and process the receipt file, any exception happened during this process, set the transaction status to Failed */
      try {

        processedTransactions.forEach(transaction -> {
          transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Downloading receipt...").build());
        });

        if ( new RbcReportProcessor(x).processReceipt(x, fileId) ) {
        processedTransactions.forEach(transaction -> {
          transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Verified receipt...").build());
          transaction.setStatus(TransactionStatus.SENT);
          ((RbcTransaction)transaction).setRbcFileCreationNumber(fileId);
          transaction.setProcessDate(new Date());
        });
        } else {
          throw new RbcFTPSException("Failed when verify receipt.");
        }
      } catch ( Exception e ) {
        throw new RbcFTPSException("Failed when verifying receipt.");
      }

      SEND_LOCK.unlock();
    } catch ( Exception e ) {
      processedTransactions.forEach(transaction -> {
        transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Failed while processing records with message: " + e.getMessage()).build());
        transaction.setStatus(TransactionStatus.FAILED);
      });
    }

    return processedTransactions;

  }

}
