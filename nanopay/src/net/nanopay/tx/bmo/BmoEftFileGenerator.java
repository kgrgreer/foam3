package net.nanopay.tx.bmo;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.CABankAccount;
import net.nanopay.model.Branch;
import net.nanopay.exchangeable.Currency;
import net.nanopay.payment.Institution;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.bmo.eftfile.*;
import net.nanopay.tx.bmo.exceptions.BmoEftFileException;
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
import java.util.stream.Collectors;

public class BmoEftFileGenerator {

  X      x;
  DAO    currencyDAO;
  DAO    bmoEftFileDAO;
  Logger logger;
  BmoAssignedClientValue         clientValue;
  private ArrayList<Transaction> passedTransactions = new ArrayList<>();

  public static final String SEND_FOLDER = System.getProperty("NANOPAY_HOME") + "/var" + "/bmo_eft/send/";
  public static final String SEND_FAILED = System.getProperty("NANOPAY_HOME") + "/var" + "/bmo_eft/send_failed/";

  public BmoEftFileGenerator(X x) {
    this.x = x;
    this.currencyDAO    = (DAO) x.get("currencyDAO");
    this.bmoEftFileDAO  = (DAO) x.get("bmoEftFileDAO");
    this.clientValue    = (BmoAssignedClientValue) x.get("bmoAssignedClientValue");
    this.logger         = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));
  }

  /**
   * Create the real file object and save it into the disk.
   * @param eftFile the BmoEftFile Object created from initFile method
   * @return the real file object
   */
  public File createEftFile(BmoEftFile eftFile) {
    File file = null;

    try {

      file = new File(SEND_FOLDER + eftFile.getFileName() + "_" + Instant.now().toEpochMilli());
      FileUtils.touch(file);
      FileUtils.writeStringToFile(file, eftFile.toBmoFormat(), false);

    } catch (IOException e) {
      this.logger.error("Error when create bmo file.", e);
      throw new BmoEftFileException("Error when create bmo file.", e);
    }

    return file;
  }

  /**
   * Convert the transaction into the BmoEftFile
   * @param transactions
   * @return
   */
  public BmoEftFile initFile(List<Transaction> transactions) {
    BmoFileHeader        fileHeader  = null;
    List<BmoBatchRecord> records     = new ArrayList<>();
    BmoFileControl       fileControl = new BmoFileControl();
    String               originatorID = "";

    if ( transactions.get(0) instanceof CITransaction ) {
      originatorID = this.clientValue.getDebitOriginatorId();
    } else {
      originatorID = this.clientValue.getCreditOriginatorId();
    }

    try {
      // file header
      fileHeader = createFileHeader(originatorID);
      fileHeader.validate(x);

      // batch record
      List<Transaction> ciTransactions = transactions.stream()
        .filter(transaction -> transaction instanceof CITransaction)
        .collect(Collectors.toList());

      List<Transaction> coTransactions = transactions.stream()
        .filter(transaction -> (transaction instanceof COTransaction || transaction instanceof BmoVerificationTransaction))
        .collect(Collectors.toList());

      BmoBatchRecord ciBatchRecord = createBatchRecord(ciTransactions);
      BmoBatchRecord coBatchRecord = createBatchRecord(coTransactions);
      if ( ciBatchRecord != null ) records.add(ciBatchRecord);
      if ( coBatchRecord != null ) records.add(coBatchRecord);
      if ( records.size() == 0 )   throw new RuntimeException("No transactions for BMO EFT");

      // file control
      fileControl.setTotalNumberOfD (ciBatchRecord == null ? 0 : ciBatchRecord.getBatchControlRecord().getBatchRecordCount());
      fileControl.setTotalValueOfD  (ciBatchRecord == null ? 0 : ciBatchRecord.getBatchControlRecord().getBatchAmount());
      fileControl.setTotalNumberOfC (coBatchRecord == null ? 0 : coBatchRecord.getBatchControlRecord().getBatchRecordCount());
      fileControl.setTotalValueOfC  (coBatchRecord == null ? 0 : coBatchRecord.getBatchControlRecord().getBatchAmount());

    } catch ( Exception e ) {
      // if any exception occurs here, no transaction will be sent out
      this.passedTransactions.clear();
      this.logger.error("Error when init bmo eft file");
      throw new BmoEftFileException("Error when init bmo eft file", e);
    }

    BmoEftFile file =           new BmoEftFile();
    file.setHeaderRecord        (fileHeader);
    file.setBatchRecords        (records.toArray(new BmoBatchRecord[records.size()]));
    file.setTrailerRecord       (fileControl);
    file.setProduction          (this.clientValue.getProduction());
    file.setFileName            (fileHeader.getFileCreationNumber() + "-" + originatorID + ".txt");
    file.setBeautifyString      (file.beautify());
    file.setFileCreationTimeEDT (BmoFormatUtil.getCurrentDateTimeEDT());

    return file;
  }

  /**
   * Create EFT file header
   */
  public BmoFileHeader createFileHeader(String originatorId) {
    int fileCreationNumber = 0;

    if ( this.clientValue.getProduction() ) {
      Count count        = (Count) bmoEftFileDAO.inX(x).where(MLang.EQ(BmoEftFile.PRODUCTION, true)).select(new Count());
      fileCreationNumber = (int) (this.clientValue.getFileCreationNumberOffset() + count.getValue() + 1);
    }

    BmoFileHeader fileHeader =              new BmoFileHeader();
    fileHeader.setOriginatorId              (originatorId);
    fileHeader.setFileCreationNumber        (fileCreationNumber);
    fileHeader.setDestinationDataCentreCode (this.clientValue.getDestinationDataCentre());
    fileHeader.setFileCreationDate          (BmoFormatUtil.getCurrentJulianDateEDT());
    return fileHeader;
  }

  public BmoBatchRecord createBatchRecord(List<Transaction> transactions) {
    if ( transactions == null || transactions.size() == 0 ) {
      return null;
    }

    BmoBatchRecord batchRecord = null;
    String         type        = transactions.get(0) instanceof CITransaction ? "D" : "C";
    ArrayList<Transaction>
             tempSuccessHolder = new ArrayList<>();

    try {
      /**
       * batch header
       */
      BmoBatchHeader batchHeader =           new BmoBatchHeader();
      batchHeader.setBatchPaymentType        (type);
      batchHeader.setTransactionTypeCode     (clientValue.getTransactionType());
      batchHeader.setPayableDate             (BmoFormatUtil.getCurrentJulianDateEDT());
      batchHeader.setOriginatorShortName     (this.clientValue.getOriginatorShortName());
      batchHeader.setOriginatorLongName      (this.clientValue.getOriginatorLongName());
      batchHeader.setInstitutionIdForReturns (this.clientValue.getInstitutionIdForReturns());
      batchHeader.setAccountNumberForReturns (this.clientValue.getAccountNumberForReturns());

      /**
       * batch details
       */
      long sum = 0;
      List<BmoDetailRecord> detailRecords = new ArrayList<>();
      for (Transaction transaction : transactions) {

        try {
          isValidTransaction(transaction);
          CABankAccount bankAccount = null;
          if ( type.equals("D") ) {
            bankAccount = getAccountById(transaction.getSourceAccount());
          } else {
            bankAccount = getAccountById(transaction.getDestinationAccount());
          }

          Branch branch = getBranchById(bankAccount.getBranch());

          BmoDetailRecord detailRecord =      new BmoDetailRecord();
          detailRecord.setAmount              (transaction.getAmount());
          detailRecord.setLogicalRecordTypeId (type);
          detailRecord.setClientName          (getNameById(bankAccount.getOwner()));
          detailRecord.setClientInstitutionId (getInstitutionById(branch.getInstitution()) + branch.getBranchId());
          detailRecord.setClientAccountNumber (bankAccount.getAccountNumber());
          detailRecord.setReferenceNumber     (String.valueOf(getRefNumber(transaction)));
          detailRecord.validate(x);

          sum = sum + transaction.getAmount();
          detailRecords.add(detailRecord);
          ((BmoTransaction)transaction). addHistory("Transaction added to EFT file");
          ((BmoTransaction)transaction). setBmoReferenceNumber(detailRecord.getReferenceNumber());
          tempSuccessHolder.             add(transaction);

        } catch ( Exception e ) {
          this.logger.error("Error when add transaction to BMO EFT file", e);
          ((BmoTransaction)transaction).addHistory(e.getMessage());
          transaction.setStatus(TransactionStatus.FAILED);
        }

      }

      /**
       * batch control
       */
      BmoBatchControl batchControl =   new BmoBatchControl();
      batchControl.setBatchPaymentType (type);
      batchControl.setBatchRecordCount (detailRecords.size());
      batchControl.setBatchAmount      (sum);
      batchControl.validate(x);

      /**
       * batch record
       */
      if ( detailRecords== null || detailRecords.size() == 0 ) {
        return null;
      }
      batchRecord =                     new BmoBatchRecord();
      batchRecord.setBatchHeaderRecord  (batchHeader);
      batchRecord.setDetailRecords      (detailRecords.toArray(new BmoDetailRecord[detailRecords.size()]));
      batchRecord.setBatchControlRecord (batchControl);
      this.passedTransactions.addAll    (tempSuccessHolder);

    } catch ( Exception e ) {
      logger.error("Error when create batch record", e);
      return null;
    }

    return batchRecord;
  }

  /**
   * We have to make sure the ref number is unique for each transaction
   */
  public long getRefNumber(Transaction transaction) {
    DAO refDAO = (DAO) x.get("bmoRefDAO");

    BmoReferenceNumber referenceNumber = new BmoReferenceNumber();
    referenceNumber.setTransactionId(transaction.getId());
    referenceNumber = (BmoReferenceNumber) refDAO.inX(x).put(referenceNumber);

    return referenceNumber.getId();
  }

  public CABankAccount getAccountById(long id) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    Account account = (Account) accountDAO.inX(x).find(id);

    if ( ! (account instanceof CABankAccount) ) {
      throw new RuntimeException("Wrong bank account type");
    }

    return (CABankAccount) account;
  }

  public String getNameById(long id) {
    DAO userDAO = (DAO) x.get("localUserDAO");

    User user = (User) userDAO.inX(x).find(id);

    String displayName = "";

    if ( ! SafetyUtil.isEmpty(user.getBusinessName().trim()) ) {
      displayName = user.getBusinessName();
    } else if ( ! SafetyUtil.isEmpty(user.getOrganization().trim()) ) {
      displayName = user.getOrganization();
    } else {
      displayName = user.getFirstName() + " " + user.getLastName();
    }

    return BmoFormatUtil.filterASCII(displayName);
  }

  public String getInstitutionById(long id) {
    DAO institutionDAO = (DAO) x.get("institutionDAO");

    Institution institution = (Institution) institutionDAO.inX(x).find(id);
    return institution.getInstitutionNumber();
  }

  public Branch getBranchById(long id) {
    DAO branchDAO = (DAO) x.get("branchDAO");

    return (Branch) branchDAO.inX(x).find(id);
  }

  public boolean isValidTransaction(Transaction transaction) {
    ((BmoTransaction) transaction).addHistory("Transaction picked by BmoEftFileGenerator");

    if ( ! (transaction instanceof BmoCITransaction || transaction instanceof BmoCOTransaction || transaction instanceof BmoVerificationTransaction) ) {
      throw new RuntimeException("Wrong transaction type");
    }

    if ( (! transaction.getSourceCurrency().equals("CAD") ) && (! transaction.getDestinationCurrency().equals("CAD")) ) {
      throw new RuntimeException("Wrong currency type");
    }

    Currency currency = (Currency) this.currencyDAO.inX(x).find(MLang.EQ(Currency.ALPHABETIC_CODE, "CAD"));
    if ( currency.getPrecision() != 2 ) {
      throw new RuntimeException("Currently only support 2 decimals");
    }

    return true;
  }

  public ArrayList<Transaction> getPassedTransactions() {
    return passedTransactions;
  }
}
