package net.nanopay.tx.bmo;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.io.FileUtils;

import foam.core.Currency;
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
import net.nanopay.payment.Institution;
import net.nanopay.payment.PADTypeLineItem;
import net.nanopay.tx.TransactionEvent;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.bmo.cico.BmoTransaction;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.bmo.eftfile.BmoBatchControl;
import net.nanopay.tx.bmo.eftfile.BmoBatchHeader;
import net.nanopay.tx.bmo.eftfile.BmoBatchRecord;
import net.nanopay.tx.bmo.eftfile.BmoDetailRecord;
import net.nanopay.tx.bmo.eftfile.BmoEftFile;
import net.nanopay.tx.bmo.eftfile.BmoFileControl;
import net.nanopay.tx.bmo.eftfile.BmoFileHeader;
import net.nanopay.tx.bmo.exceptions.BmoEftFileException;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.cico.EFTFileGenerator;
import net.nanopay.tx.cico.EFTFileUtil;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class BmoEftFileGenerator implements EFTFileGenerator {

  X      x;
  DAO    currencyDAO;
  DAO    bmoEftFileDAO;
  Logger logger;
  private ArrayList<Transaction> passedTransactions = new ArrayList<>();

  public static final String SEND_FOLDER = System.getProperty("NANOPAY_HOME") + "/var" + "/bmo_eft/send/";
  public static final String SEND_FAILED = System.getProperty("NANOPAY_HOME") + "/var" + "/bmo_eft/send_failed/";

  public X getX() {
    return x;
  }
  
  public BmoEftFileGenerator(X x) {
    this.x = x;
    this.currencyDAO    = (DAO) x.get("currencyDAO");
    this.bmoEftFileDAO  = (DAO) x.get("bmoEftFileDAO");
    this.logger         = new PrefixLogger(new String[] {"BMO"}, (Logger) x.get("logger"));
  }

  public BmoAssignedClientValue getClientValue() {
    BmoAssignedClientValue clientValue = (BmoAssignedClientValue) getX().get("bmoAssignedClientValue");
    if ( clientValue == null ) {
      throw new RuntimeException("Invalid credentials");
    }
    return clientValue;
  }
  
  /**
   * Create the real file object and save it into the disk.		
   * @param transactions a list of transactins to be sent
   * @return an EFTFile model
   */
  public EFTFile generate(List<Transaction> transactions) {
    try {
      BmoEftFile bmoFile = initFile(transactions);
      bmoFile.setFile(createEftFile(bmoFile).getId());
      bmoFile.setProvider("BMO"); // TODO set provider appropriately
      return (BmoEftFile) ((DAO) this.x.get("bmoEftFileDAO")).put(bmoFile);
    } catch (Throwable t) {
      this.logger.error("BMO Error generating EFT File. " + t.getMessage(), t);
      throw new BmoEftFileException("BMO Error generating EFT File. " + t.getMessage(), t);
    }
  }

  /**
   * Create the real file object and save it into the disk.
   * @param eftFile the BmoEftFile Object created from initFile method
   * @return the real file object
   */
  public foam.nanos.fs.File createEftFile(BmoEftFile eftFile) {
    try {

      InputStream in = new ByteArrayInputStream(eftFile.toBmoFormat().getBytes());
      return EFTFileUtil.storeEFTFile(this.x, in, eftFile.getFileName()
        , Long.valueOf(eftFile.toBmoFormat().getBytes().length), "text/csv");

    } catch (Throwable t) {
      this.logger.error("Error when create bmo file.", t);
      throw new BmoEftFileException("Error when create bmo file.", t);
    }
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
      originatorID = getClientValue().getDebitOriginatorId();
    } else {
      originatorID = getClientValue().getCreditOriginatorId();
    }

    try {
      // file header
      fileHeader = createFileHeader(originatorID);
      fileHeader.validate(x);

      // batch record for CI
      List<Transaction> ciTransactions = transactions.stream()
        .filter(transaction -> transaction instanceof CITransaction)
        .collect(Collectors.toList());

      HashMap<Integer, List<Transaction>> ciGroupTransactions = groupTransactionByType(x, ciTransactions);
      int ciCount = 0; long ciAmount = 0;
      for ( Integer type : ciGroupTransactions.keySet() ) {
        BmoBatchRecord record = createBatchRecord(type, ciGroupTransactions.get(type));
        if ( record != null ) {
          records.add(record);
          ciCount = ciCount + record.getBatchControlRecord().getBatchRecordCount();
          ciAmount = ciAmount + record.getBatchControlRecord().getBatchAmount();
        }
      }

      // batch record for CO
      List<Transaction> coTransactions = transactions.stream()
        .filter(transaction -> (transaction instanceof COTransaction || transaction instanceof BmoVerificationTransaction))
        .collect(Collectors.toList());
      int coCount = 0; long coAmount = 0;
      HashMap<Integer, List<Transaction>> coGroupTransactions = groupTransactionByType(x, coTransactions);
      for ( Integer type : coGroupTransactions.keySet() ) {
        BmoBatchRecord record = createBatchRecord(type, coGroupTransactions.get(type));
        if ( record != null ) {
          records.add(record);
          coCount = coCount + record.getBatchControlRecord().getBatchRecordCount();
          coAmount = coAmount + record.getBatchControlRecord().getBatchAmount();
        }
      }

      if ( records.size() == 0 )   throw new RuntimeException("No transactions for BMO EFT");

      // file control
      fileControl.setTotalNumberOfD (ciCount);
      fileControl.setTotalValueOfD  (ciAmount);
      fileControl.setTotalNumberOfC (coCount);
      fileControl.setTotalValueOfC  (coAmount);

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
    file.setProduction          (getClientValue().getProduction());
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

    if ( getClientValue().getProduction() ) {
      Count count        = (Count) bmoEftFileDAO.inX(x).where(MLang.EQ(BmoEftFile.PRODUCTION, true)).select(new Count());
      fileCreationNumber = (int) (getClientValue().getFileCreationNumberOffset() + count.getValue() + 1);
    }

    BmoFileHeader fileHeader =              new BmoFileHeader();
    fileHeader.setOriginatorId              (originatorId);
    fileHeader.setFileCreationNumber        (fileCreationNumber);
    fileHeader.setDestinationDataCentreCode (getClientValue().getDestinationDataCentre());
    fileHeader.setFileCreationDate          (BmoFormatUtil.getCurrentJulianDateEDT());
    return fileHeader;
  }

  public BmoBatchRecord createBatchRecord(int PADType, List<Transaction> transactions) {
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
      batchHeader.setPayableDate             (BmoFormatUtil.getCurrentJulianDateEDT());
      batchHeader.setOriginatorShortName     (getClientValue().getOriginatorShortName());
      batchHeader.setOriginatorLongName      (getClientValue().getOriginatorLongName());
      batchHeader.setInstitutionIdForReturns (getClientValue().getInstitutionIdForReturns());
      batchHeader.setAccountNumberForReturns (getClientValue().getAccountNumberForReturns());
      if ( PADType != -1l ) {
        batchHeader.setTransactionTypeCode   (PADType);
      } else {
        batchHeader.setTransactionTypeCode   (getClientValue().getTransactionType());
      }

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
          detailRecord.setAmount              (-transaction.getTotal(x, transaction.getSourceAccount()));
          detailRecord.setLogicalRecordTypeId (type);
          detailRecord.setClientName          (getNameById(bankAccount.getOwner()));
          // Question: Would BMO accept the standard 9 digit Canadian routing code? Or just the institution + branch which is only 8 digits.
          detailRecord.setClientInstitutionId (getInstitutionById(branch.getInstitution()) + branch.getBranchId());
          detailRecord.setClientAccountNumber (bankAccount.getAccountNumber());
          detailRecord.setReferenceNumber     (String.valueOf(getRefNumber(transaction)));
          detailRecord.validate(x);

          sum = sum + -transaction.getTotal(x, transaction.getSourceAccount());
          detailRecords.add(detailRecord);
          transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction added to EFT file").build());
          ((BmoTransaction)transaction). setBmoReferenceNumber(detailRecord.getReferenceNumber());
          tempSuccessHolder.             add(transaction);

        } catch ( Exception e ) {
          this.logger.error("Error when add transaction to BMO EFT file", e);
          transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent(e.getMessage()).build());
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

  public CABankAccount getAccountById(String id) {
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
    transaction.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent("Transaction picked by BmoEftFileGenerator").build());

    if ( ! (transaction instanceof BmoCITransaction || transaction instanceof BmoCOTransaction || transaction instanceof BmoVerificationTransaction) ) {
      throw new RuntimeException("Wrong transaction type");
    }

    if ( (! transaction.getSourceCurrency().equals("CAD") ) && (! transaction.getDestinationCurrency().equals("CAD")) ) {
      throw new RuntimeException("Wrong currency type");
    }

    Currency currency = (Currency) this.currencyDAO.inX(x).find(MLang.EQ(Currency.ID, "CAD"));
    if ( currency.getPrecision() != 2 ) {
      throw new RuntimeException("Currently only support 2 decimals");
    }

    return true;
  }

  public HashMap<Integer, List<Transaction>> groupTransactionByType(X x, List<Transaction> transactions) {
    HashMap<Integer, List<Transaction>> result = new HashMap<>();

    for ( Transaction transaction : transactions ) {
      int type = PADTypeLineItem.getPADTypeFrom(x, transaction) == null ? -1 : (int) PADTypeLineItem.getPADTypeFrom(x, transaction).getId();

      if ( ! result.containsKey(type) ) {
        ArrayList<Transaction> newList = new ArrayList<>();
        newList.add(transaction);
        result.put(type, newList);
      } else {
        result.get(type).add(transaction);
      }
    }

    return result;
  }

  public ArrayList<Transaction> getPassedTransactions() {
    return passedTransactions;
  }
}
