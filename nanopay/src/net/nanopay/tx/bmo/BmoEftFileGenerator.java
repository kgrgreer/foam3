package net.nanopay.tx.bmo;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.CABankAccount;
import net.nanopay.model.Branch;
import net.nanopay.model.Currency;
import net.nanopay.payment.Institution;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.tx.bmo.eftfile.*;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class BmoEftFileGenerator {

  X x;
  DAO clientValueDAO;
  DAO currencyDAO;
  DAO bmoEftFileDAO;
  BmoAssignedClientValue clientValue;

  private static final String PATH = System.getenv("JOURNAL_HOME") + "/bmo_eft/";

  public BmoEftFileGenerator init(X x) {
    this.x = x;
    this.clientValueDAO = (DAO) x.get("bmoClientValueDAO");
    this.clientValue = (BmoAssignedClientValue) clientValueDAO.inX(x).find(1);
    this.currencyDAO = (DAO) x.get("currencyDAO");
    this.bmoEftFileDAO = (DAO) x.get("bmoEftFileDAO");
    return this;
  }

  public void createEftFile(List<Transaction> transactions) {
    try {
      BmoEftFile eftFile = generateFile(transactions);

      File file = new File(PATH + eftFile.getFileName());
      FileUtils.touch(file);
      FileUtils.writeStringToFile(file, eftFile.toBmoFormat());

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public BmoEftFile generateFile(List<Transaction> transactions) {

    // file header
    BmoFileHeader fileHeader = createFileHeader(clientValue);


    // batch record
    List<Transaction> ciTransactions = transactions.stream()
      .filter(transaction -> transaction instanceof CITransaction)
      .collect(Collectors.toList());

    List<Transaction> coTransactions = transactions.stream()
      .filter(transaction -> transaction instanceof COTransaction)
      .collect(Collectors.toList());

    BmoBatchRecord ciBatchRecord = createBatchRecord(ciTransactions);
    BmoBatchRecord coBatchRecord = createBatchRecord(coTransactions);
    List<BmoBatchRecord> records = new ArrayList<>();
    records.add(ciBatchRecord);
    records.add(coBatchRecord);

    // file control
    BmoFileControl fileControl = new BmoFileControl();
    fileControl.setTotalNumberOfD(ciBatchRecord.getBatchControlRecord().getBatchRecordCount());
    fileControl.setTotalValueOfD(ciBatchRecord.getBatchControlRecord().getBatchAmount());
    fileControl.setTotalNumberOfC(coBatchRecord.getBatchControlRecord().getBatchRecordCount());
    fileControl.setTotalValueOfC(coBatchRecord.getBatchControlRecord().getBatchAmount());


    BmoEftFile file = new BmoEftFile();
    file.setHeaderRecord(fileHeader);
    file.setBatchRecords(records.toArray(new BmoBatchRecord[records.size()]));
    file.setTrailerRecord(fileControl);
    file.setEnv(clientValue.getEnv());
    file.setFileName(fileHeader.getFileCreationNumber() + ".txt");
    file.setBeautifyString(file.beautify());
    file.setFileCreationTimeEST(BmoFormatUtil.getCurrentDateTimeEST());

    bmoEftFileDAO.inX(x).put(file);

    return file;
  }

  public BmoFileHeader createFileHeader(BmoAssignedClientValue clientValue) {
    int fileCreationNumber = 0;

    if ( clientValue.getEnv().equals("production") ) {
      Count count = (Count) bmoEftFileDAO.inX(x).where(MLang.EQ(BmoEftFile.ENV, "development")).select(new Count());
      fileCreationNumber = (int) (count.getValue() + 1);
    }

    BmoFileHeader fileHeader = new BmoFileHeader();
    fileHeader.setOriginatorId(clientValue.getOriginatorId());
    fileHeader.setFileCreationNumber(fileCreationNumber);
    fileHeader.setDestinationDataCentreCode("00001");
    fileHeader.setFileCreationDate(BmoFormatUtil.getCurrentJulianDateEST());
    return fileHeader;
  }

  public BmoBatchRecord createBatchRecord(List<Transaction> transactions) {
    BmoBatchRecord batchRecord = new BmoBatchRecord();
    String type = transactions.get(0) instanceof CITransaction ? "D" : "C";

    /**
     * batch header
     */
    BmoBatchHeader batchHeader = new BmoBatchHeader();
    batchHeader.setBatchPaymentType(type);
    batchHeader.setTransactionTypeCode(999);
    batchHeader.setPayableDate(BmoFormatUtil.getCurrentJulianDateEST());
    batchHeader.setOriginatorShortName(clientValue.getOriginatorShortName());
    batchHeader.setOriginatorLongName(clientValue.getOriginatorLongName());
    batchHeader.setInstitutionIdForReturns(clientValue.getInstitutionIdForReturns());
    batchHeader.setAccountNumberForReturns(clientValue.getAccountNumberForReturns());
    batchRecord.setBatchHeaderRecord(batchHeader);

    /**
     * batch details
     */
    long sum = 0;
    List<BmoDetailRecord> detailRecords = new ArrayList<>();
    for (Transaction transaction : transactions) {
      isValidTransaction(transaction);

      CABankAccount bankAccount = null;
      if ( type.equals("D") ) {
        bankAccount = getAccountById(transaction.getSourceAccount());
      } else {
        bankAccount = getAccountById(transaction.getDestinationAccount());
      }

      BmoDetailRecord detailRecord = new BmoDetailRecord();
      detailRecord.setAmount(transaction.getAmount());
      detailRecord.setLogicalRecordTypeId(type);
      detailRecord.setClientName(getNameById(bankAccount.getOwner()));
      detailRecord.setClientInstitutionId(getInstitutionById(bankAccount.getInstitution()) + getBranchById(bankAccount.getBranch()));
      detailRecord.setClientAccountNumber(bankAccount.getAccountNumber());
      detailRecord.setReferenceNumber(String.valueOf(getRefNumber(transaction)));

      sum = sum + transaction.getAmount();
      detailRecords.add(detailRecord);
    }
    batchRecord.setDetailRecords(detailRecords.toArray(new BmoDetailRecord[detailRecords.size()]));

    /**
     * batch control
     */
    BmoBatchControl batchControl = new BmoBatchControl();
    batchControl.setBatchPaymentType(type);
    batchControl.setBatchRecordCount(detailRecords.size());
    batchControl.setBatchAmount(sum);
    batchRecord.setBatchControlRecord(batchControl);

    return batchRecord;
  }

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

    if ( ! SafetyUtil.isEmpty(user.getBusinessName()) ) {
      displayName = user.getBusinessName();
    } else {
      displayName = user.getFirstName() + " " + user.getLastName();
    }

    return displayName;
  }

  public String getInstitutionById(long id) {
    DAO institutionDAO = (DAO) x.get("institutionDAO");

    Institution institution = (Institution) institutionDAO.inX(x).find(id);
    return institution.getInstitutionNumber();
  }

  public String getBranchById(long id) {
    DAO branchDAO = (DAO) x.get("branchDAO");

    Branch branch = (Branch) branchDAO.inX(x).find(id);

    return branch.getBranchId();
  }

  public boolean isValidTransaction(Transaction transaction) {
    if ( ! (transaction instanceof CITransaction || transaction instanceof COTransaction) ) {
      throw new RuntimeException("Wrong transaction type");
    }

    if ( ! transaction.getSourceCurrency().equals("CAD") && ! transaction.getDestinationCurrency().equals("CAD") ) {
      throw new RuntimeException("Wrong currency type");
    }

    Currency currency = (Currency) this.currencyDAO.inX(x).find(MLang.EQ(Currency.ALPHABETIC_CODE, "CAD"));
    if ( currency.getPrecision() != 2 ) {
      throw new RuntimeException("Currently only support 2 decimals");
    }

    return true;
  }
}
