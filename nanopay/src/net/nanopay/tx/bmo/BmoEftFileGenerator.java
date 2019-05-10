package net.nanopay.tx.bmo;

import net.nanopay.tx.bmo.eftfile.*;
import net.nanopay.tx.model.Transaction;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class BmoEftFileGenerator {

  public void generateFile(List<Transaction> transactions) {

    this.mockFile();
  }

  public BmoEftFile mockFile() {

    BmoEftFile eftFile = new BmoEftFile();
    BmoAssignedClientValue clientValue = mockClientValue();

    /**
     * File header
     */
    BmoFileHeader fileHeader = new BmoFileHeader();
    fileHeader.setOriginatorId(clientValue.getOriginatorId());
    fileHeader.setFileCreationNumber(1);
    fileHeader.setDestinationDataCentreCode(clientValue.getDestinationDataCentre());

    System.out.println(fileHeader.toBmoFormat());


    /**
     * Batch record
     */
    BmoBatchHeader batchHeader = new BmoBatchHeader();
    batchHeader.setBatchPaymentType("D");
    batchHeader.setTransactionTypeCode(999);
    batchHeader.setPayableDate(new Date());
    batchHeader.setOriginatorShortName(clientValue.getOriginatorShortName());
    batchHeader.setOriginatorLongName(clientValue.getOriginatorLongName());
    batchHeader.setInstitutionIdForReturns(clientValue.getInstitutionIdForReturns());
    batchHeader.setAccountNumberForReturns(clientValue.getAccountNumberForReturns());
    System.out.println(batchHeader.toBmoFormat());


    List<BmoDetailRecord> detailRecords = new ArrayList<>();
    BmoDetailRecord detailRecord = new BmoDetailRecord();
    detailRecord.setAmount(9999);
    detailRecord.setLogicalRecordTypeId("D");
    detailRecord.setClientInstitutionId("012312345");
    detailRecord.setClientAccountNumber("1234567");
    detailRecord.setClientName("SIREN CHEN");
    detailRecord.setReferenceNumber("NANO123");
    System.out.println(detailRecord.toBmoFormat());

    detailRecords.add(detailRecord);
    detailRecords.add(detailRecord);

    BmoBatchControl batchControl = new BmoBatchControl();
    batchControl.setBatchPaymentType("D");
    batchControl.setBatchRecordCount(2);
    batchControl.setBatchAmount(19998);
    System.out.println(batchControl.toBmoFormat());


    BmoFileControl fileControl = new BmoFileControl();
    fileControl.setTotalNumberOfD(2);
    fileControl.setTotalValueOfD(19998);
    fileControl.setTotalValueOfC(0);
    fileControl.setTotalNumberOfD(0);
    System.out.println(fileControl.toBmoFormat());

    return null;
  }

  public BmoAssignedClientValue mockClientValue() {

    BmoAssignedClientValue clientValue = new BmoAssignedClientValue();


    clientValue.setOriginatorId("1010101010");
    clientValue.setDestinationDataCentre("001");
    clientValue.setOriginationControlDataAndIdentification("TEMP");
    clientValue.setOriginatorShortName("NANOPAY        ");
    clientValue.setOriginatorLongName("NANOPAY LONG NAME             ");

    clientValue.setInstitutionIdForReturns("077799999");
    clientValue.setAccountNumberForReturns("1234567");

    clientValue.setAccountingInformation("accounting information");

    clientValue.setFundingAccountNumber("7654321");
    clientValue.setAccountNumberForReturns("1234567");
    clientValue.setAccountNumberForRecalls("1234567");


    return clientValue;
  }


}
