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
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.rbc.exceptions.RbcFTPSException;
import net.nanopay.tx.rbc.iso20022file.RbcBatchRecord;
import net.nanopay.tx.rbc.iso20022file.RbcCIRecord;
import net.nanopay.tx.rbc.iso20022file.RbcCORecord;
import net.nanopay.tx.rbc.iso20022file.RbcRecord;
import net.nanopay.tx.rbc.RbcFileProcessor;
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

  protected Logger logger;
  DAO transactionDAO;

  @Override
  public void execute(X x) {

    /**
     * get transactions
     */
    transactionDAO = (DAO) x.get("localTransactionDAO");
    logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

    Predicate condition1 = MLang.OR(
      MLang.INSTANCE_OF(RbcCITransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(RbcCOTransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(RbcVerificationTransaction.getOwnClassInfo())
    );

    Predicate condition2 = MLang.EQ(
      Transaction.STATUS, TransactionStatus.PENDING
    );

    Predicate condition3 = MLang.OR(
      MLang.EQ(RbcCITransaction.RBC_FILE_CREATION_NUMBER, 0),
      MLang.EQ(RbcCOTransaction.RBC_FILE_CREATION_NUMBER, 0)
    );

    ArraySink sink = (ArraySink) transactionDAO.where(
      MLang.AND(condition1, condition2, condition3)
    ).select(new ArraySink());
    List<Transaction> transactions = (ArrayList<Transaction>) sink.getArray();

    try{
      RBCEFTFileGenerator generator = new RBCEFTFileGenerator(x);
      // Get Batch Records
      RbcBatchRecord batch = null;
      try {
        logger.info("transactions count after clone " + transactions.size());
        transactions.forEach(transaction -> transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Ready to generate AFT file.").build()));
        batch = generator.createBatch(transactions);
      } catch ( Exception e ) {
        logger.error("RBC Batch Error : " + e.getMessage(), e);
        BmoFormatUtil.sendEmail(x, "RBC EFT Error creating ISO20022 Batch files.", e); // TODO
      }
      
      if ( batch != null ) {
        transactions.forEach(transaction -> transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Ready to process AFT file.").build()));
        // Process CI Transactions
        try{
          processRecords(x, batch.getCiRecords());
        } catch ( Exception e ) {
          logger.error("RBC CI Transaction Records : " + e.getMessage(), e);
        }

        logger.info("Finishing send CI transaction.");
        try {
          Thread.sleep(3000);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }

        // Process CO Transactions
        logger.info("processing CO transactions.");
        try{
          processRecords(x, batch.getCoRecords());
        } catch ( Exception e ) {
          logger.error("RBC CO Transaction Records : " + e.getMessage(), e);
        }

        logger.info("Finishing send CO transaction.");
      }
    } catch ( Exception e ) {
      logger.error("RBC ISO20022 : " + e.getMessage(), e);
    } 
  }

  protected void processRecords(X x, RbcRecord records) {
    if ( records == null ) return;
    List<Transaction> transactions = Arrays.asList(records.getTransactions());
    transactions = transactions.stream().map(transaction -> (Transaction)transaction.fclone()).collect(Collectors.toList());
    
    /* Send file to RBC */
    try{
      new RbcFileProcessor(x).send(records.getFile());  
    } catch ( Exception e ) {
      logger.error("RBC send file failed.", e);
    } finally {
      transactions.forEach(transaction -> {
        transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("File sent").build());
        ((RbcTransaction)transaction).setRbcFileCreationNumber(records.getFile());
        transaction.setProcessDate(new Date());
        transactionDAO.inX(x).put(transaction);
      });
    }

  }

}
