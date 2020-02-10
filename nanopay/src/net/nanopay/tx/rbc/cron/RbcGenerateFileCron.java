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

  @Override
  public void execute(X x) {

    /**
     * get transactions
     */
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

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
    ArrayList<Transaction> transactions = (ArrayList<Transaction>) sink.getArray();

    generate(x, transactions);
    
  }

  public void generate(X x, List<Transaction> transactions) {

    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

    try {

      transactions = transactions.stream().map(transaction -> (Transaction)transaction.fclone()).collect(Collectors.toList());

      logger.info("Generating EFT file for CI transactions.");

      List<Transaction> ciTransactions = transactions.stream()
        .filter(transaction -> transaction instanceof CITransaction)
        .collect(Collectors.toList());
      
      generateFile(x, ciTransactions);
  
      logger.info("Generating EFT File for CO transactions.");

      List<Transaction> coTransactions = transactions.stream()
        .filter(transaction -> (transaction instanceof COTransaction || transaction instanceof RbcVerificationTransaction))
        .collect(Collectors.toList());

      generateFile(x, coTransactions);
  
    } catch ( Exception e ) {
      logger.error("RBC EFT File Generation Failed : " + e.getMessage(), e);
    } 

  }

  protected void generateFile(X x, List<Transaction> transactions) {
    if ( transactions == null || transactions.isEmpty() ) {
      return;
    }

    Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
    RBCEFTFileGenerator fileGenerator = new RBCEFTFileGenerator(x);
    try {
      EFTFile eftFile = (EFTFile) fileGenerator.generate(transactions);
      if ( eftFile == null ) throw new RuntimeException("Generated EFT File was null");
      ArrayList<Transaction> passedTransaction  = fileGenerator.getPassedTransactions();

      try {
        passedTransaction.forEach(transaction -> {
          transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("RBC EFT File Generated.").build());
          ((RbcTransaction)transaction).setRbcFileCreationNumber(eftFile.getId());
          transaction.setProcessDate(new Date()); 
          transaction.setStatus(TransactionStatus.SENT);
          ((DAO) x.get("localTransactionDAO")).inX(x).put(transaction);
        });
        eftFile.setStatus(EFTFileStatus.GENERATED);
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

}
