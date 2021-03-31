/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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

foam.CLASS({
  package: 'net.nanopay.tx.rbc',
  name: 'RBCTransactionISO20022Util',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.util.SafetyUtil',
    'foam.core.ValidationException',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.model.Business',
    'net.nanopay.model.Branch',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.iso20022.CustomerCreditTransferInitiationV03',
    'net.nanopay.iso20022.GroupHeader32',
    'net.nanopay.payment.Institution',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.TransactionDAO',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionEntity',
    'net.nanopay.tx.rbc.iso20022file.RbcCIRecord',
    'net.nanopay.tx.rbc.iso20022file.RbcCORecord',
    'net.nanopay.tx.TransactionEvent',
    'net.nanopay.tx.model.TransactionStatus',
    'java.math.BigDecimal',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.TimeZone',
  ],

  methods: [
    {
      name: 'generateCORecords',
      type: 'net.nanopay.tx.rbc.iso20022file.RbcCORecord',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'transactions', type: 'net.nanopay.tx.model.Transaction[]' },
        { name: 'batchFileId', type: 'String' },
      ],
      javaCode: `
      Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));
      if( transactions == null || transactions.length < 1 ) return null;

      RbcCORecord coRecords = new RbcCORecord();
      int transactionCount = 0;
      Long transactionVal = 0L;
      Transaction spidTxn = transactions[0];
      ServiceProvider spid = (ServiceProvider) ((DAO) x.get("localServiceProviderDAO")).find(spidTxn.getSpid());
      RbcAssignedClientValue rbcValues = (RbcAssignedClientValue) x.get("rbcAssignedClientValue");
      BankAccount fundingAccount = (BankAccount) ((DAO) x.get("accountDAO")).find(rbcValues.getAccountId());
      if ( fundingAccount == null ) throw new RuntimeException("nanopay bank account cannot be null");

      net.nanopay.iso20022.Pain00100103 pain00100103Msg = new net.nanopay.iso20022.Pain00100103();
      CustomerCreditTransferInitiationV03 cstmrCdtTrfInitn = new CustomerCreditTransferInitiationV03();

      // Group Header
      GroupHeader32 grpHdr = new GroupHeader32();
      grpHdr.setMessageIdentification(removeSpecialChars(batchFileId)); // MessageId mustbe unique within the last 180 days.
      Calendar created = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
      grpHdr.setCreationDateTime(created.getTime());

      net.nanopay.iso20022.PartyIdentification32 initgPty = new net.nanopay.iso20022.PartyIdentification32();
      net.nanopay.iso20022.Party6Choice id = new net.nanopay.iso20022.Party6Choice();
      net.nanopay.iso20022.OrganisationIdentification4  orgId = new net.nanopay.iso20022.OrganisationIdentification4();
      net.nanopay.iso20022.GenericOrganisationIdentification1 othr = new net.nanopay.iso20022.GenericOrganisationIdentification1();
      othr.setIdentification(rbcValues.getInitiatingPartyId()); // RBC w ill provide production and test IDs.
      othr.setIssuer(spid.getPaymentIssuerTag());
      orgId.setOther(new net.nanopay.iso20022.GenericOrganisationIdentification1[]{othr});
      id.setOrgId(orgId);
      initgPty.setIdentification(id);
      grpHdr.setInitiatingParty(initgPty);

      // Payment Information
      net.nanopay.iso20022.PaymentInstructionInformation3 pmtInf = new net.nanopay.iso20022.PaymentInstructionInformation3();
      pmtInf.setPaymentInformationIdentification("1"); // TODO is this ok since there's just one block of Payment Information
      pmtInf.setPaymentMethod(net.nanopay.iso20022.PaymentMethod3Code.TRF);
      net.nanopay.iso20022.PaymentTypeInformation19 pmtTpInf = new net.nanopay.iso20022.PaymentTypeInformation19();
      net.nanopay.iso20022.ServiceLevel8Choice svcLvl = new net.nanopay.iso20022.ServiceLevel8Choice();
      svcLvl.setPrtry("NORM");
      pmtTpInf.setServiceLevel(svcLvl);
      pmtInf.setPaymentTypeInformation(pmtTpInf);
      pmtInf.setRequestedExecutionDate(created.getTime()); // TODO check ISODate formats properly

      // Debitor
      net.nanopay.iso20022.PartyIdentification32 debtor = new net.nanopay.iso20022.PartyIdentification32();
      debtor.setName("Nanopay Corporation"); // Hardcode this?
      net.nanopay.iso20022.Party6Choice debtorId = new net.nanopay.iso20022.Party6Choice();
      net.nanopay.iso20022.OrganisationIdentification4  debtorOrgId = new net.nanopay.iso20022.OrganisationIdentification4();
      net.nanopay.iso20022.GenericOrganisationIdentification1 debtorOthr = new net.nanopay.iso20022.GenericOrganisationIdentification1();
      debtorOthr.setIdentification(rbcValues.getPDSAccountNumber()); // Grads Service Account Number supplied by RBC
      net.nanopay.iso20022.OrganisationIdentificationSchemeName1Choice schmeNm = new net.nanopay.iso20022.OrganisationIdentificationSchemeName1Choice();
      schmeNm.setCd("BANK");
      debtorOthr.setSchemeName(schmeNm);
      debtorOthr.setIssuer(spid.getPaymentIssuerTag());
      debtorOrgId.setOther(new net.nanopay.iso20022.GenericOrganisationIdentification1[]{debtorOthr});
      debtorId.setOrgId(debtorOrgId);
      debtor.setIdentification(debtorId);
      pmtInf.setDebtor(debtor);

      // TODO Address is only required for US payments
      // if ( senderAddress != null ) {
      //   net.nanopay.iso20022.PostalAddress6 pstlAdr = new net.nanopay.iso20022.PostalAddress6();
      //   String streetName = senderAddress.getStreetName() == null ? "" : senderAddress.getStreetName();
      //   String buildingNumber = senderAddress.getStreetNumber() == null ? "" : senderAddress.getStreetNumber();
      //   pstlAdr.setStreetName(removeSpecialChars(streetName.substring(0, Math.min(streetName.length(), 25))));
      //   pstlAdr.setBuildingNumber(removeSpecialChars(buildingNumber.substring(0, Math.min(buildingNumber.length(), 10))));
      //   pstlAdr.setPostCode(senderAddress.getPostalCode());
      //   pstlAdr.setTownName(senderAddress.getCity());
      //   pstlAdr.setCountrySubDivision(senderAddress.getRegionId());
      //   pstlAdr.setCountry(senderAddress.getCountryId());
      //   debtor.setPostalAddress(pstlAdr);
      // }

      // Debitor Account
      net.nanopay.iso20022.CashAccount16 dbtrAcct = new net.nanopay.iso20022.CashAccount16();
      net.nanopay.iso20022.AccountIdentification4Choice acctId = new net.nanopay.iso20022.AccountIdentification4Choice();
      net.nanopay.iso20022.GenericAccountIdentification1 acctOthr = new net.nanopay.iso20022.GenericAccountIdentification1();
      acctOthr.setIdentification(fundingAccount.getAccountNumber()); // Debiting RBC DDA AccountNumber associated to the ACH product/service.
      acctId.setOthr(acctOthr);
      dbtrAcct.setIdentification(acctId);
      pmtInf.setDebtorAccount(dbtrAcct);

      // Debitor Agent
      net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4 dbtrAgt = new net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4();
      net.nanopay.iso20022.FinancialInstitutionIdentification7 finInstnId = new net.nanopay.iso20022.FinancialInstitutionIdentification7();
      net.nanopay.iso20022.ClearingSystemMemberIdentification2 clrSysMmbId = new net.nanopay.iso20022.ClearingSystemMemberIdentification2();
      net.nanopay.iso20022.ClearingSystemIdentification2Choice clrSysId = new net.nanopay.iso20022.ClearingSystemIdentification2Choice();
      clrSysId.setCd("CACPA");
      clrSysMmbId.setClearingSystemIdentification(clrSysId);

      String insNumber = "";
      String branchNum = "";
      String insName = "";
      Branch b = fundingAccount.findBranch(x);
      if ( b != null ) {
        branchNum = padLeftWithZeros(b.getBranchId(), 5);
        Institution inst = (Institution) b.findInstitution(x);
        if ( inst != null ) {
          insName = inst.getName();
          insNumber = padLeftWithZeros(inst.getInstitutionNumber(), 4);
        }
      }

      StringBuilder memId = new StringBuilder();
      memId.append(insNumber);
      memId.append(branchNum);
      clrSysMmbId.setMemberIdentification(memId.toString());
      finInstnId.setClearingSystemMemberIdentification(clrSysMmbId);
      finInstnId.setName(insName);
      dbtrAgt.setFinancialInstitutionIdentification(finInstnId);
      pmtInf.setDebtorAgent(dbtrAgt);

      // Credit Transfer Transaction Information
      List<net.nanopay.iso20022.CreditTransferTransactionInformation10> cdtTrfTxInfList = new ArrayList<>();
      List<Transaction> processedTransactions = new ArrayList<>();
      for( Transaction txn : transactions ) {
        try{
          isValidTransaction(txn);
          txn = (Transaction) txn.fclone();
          Invoice invoice = txn.findInvoiceId(x);
          BankAccount destAccount = (BankAccount) txn.findDestinationAccount(x);
          if( destAccount == null ) continue;
          User payee = destAccount.findOwner(x);
          Address payeeAddress = payee == null ? null : payee.getAddress();
          // TODO: It looks like payee address is required, so the below check for getStructured() should be done here or we need to be able to find a way to send in an unstructured address
          if ( payeeAddress == null ) throw new RuntimeException("Invalid Payee address.");

          net.nanopay.iso20022.CreditTransferTransactionInformation10 cdtTrfTxInf = new net.nanopay.iso20022.CreditTransferTransactionInformation10();
          net.nanopay.iso20022.PaymentIdentification1 pmtId = new net.nanopay.iso20022.PaymentIdentification1();
          String refNumber = String.valueOf(getRefNumber(x, txn));
          pmtId.setEndToEndIdentification(refNumber);
          ((RbcTransaction)txn).setRbcReferenceNumber(refNumber);
          cdtTrfTxInf.setPaymentIdentification(pmtId);
          net.nanopay.iso20022.PaymentTypeInformation19 pmtTpInf2 = new net.nanopay.iso20022.PaymentTypeInformation19();
          net.nanopay.iso20022.CategoryPurpose1Choice ctgyPurp = new net.nanopay.iso20022.CategoryPurpose1Choice();
          ctgyPurp.setCd(this.getCategoryPurposeCodes(x, txn, logger));
          pmtTpInf2.setCategoryPurpose(ctgyPurp);
          cdtTrfTxInf.setPaymentTypeInformation(pmtTpInf2);

          net.nanopay.iso20022.AmountType3Choice amt = new net.nanopay.iso20022.AmountType3Choice();
          net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount instdAmt = new net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount();
          instdAmt.setCcy(txn.getDestinationCurrency());
          instdAmt.setText(toDecimal(-txn.getTotal(x, txn.getSourceAccount()))); // TODO should be getDestinationAmount for future USD purposes
          amt.setInstdAmt(instdAmt);
          cdtTrfTxInf.setAmount(amt);

          // Creditor Agent
          net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4 cdtrAgt = new net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4();
          net.nanopay.iso20022.FinancialInstitutionIdentification7 finInstnId2 = new net.nanopay.iso20022.FinancialInstitutionIdentification7();
          net.nanopay.iso20022.ClearingSystemMemberIdentification2 clrSysMmbId2 = new net.nanopay.iso20022.ClearingSystemMemberIdentification2();
          net.nanopay.iso20022.ClearingSystemIdentification2Choice clrSysId2 = new net.nanopay.iso20022.ClearingSystemIdentification2Choice();
          clrSysId2.setCd("CA".equals(destAccount.getCountry()) ? "CACPA" : "USABA");
          clrSysMmbId2.setClearingSystemIdentification(clrSysId2);
          String institutionNumber = "";
          String branchNumber = "";
          String institutionName = "";
          Branch branch = destAccount.findBranch(x);
          if ( branch != null ) {
            branchNumber = padLeftWithZeros(String.valueOf(( branch.getBranchId() )), 5);
            Institution institution = (Institution) branch.findInstitution(x);
            if ( institution != null ) {
              institutionName = institution.getName();
              institutionNumber = padLeftWithZeros(String.valueOf((institution.getInstitutionNumber() )), 4);
            }
          }
          clrSysMmbId2.setMemberIdentification(institutionNumber + branchNumber);
          finInstnId2.setClearingSystemMemberIdentification(clrSysMmbId2);
          if ( "US".equals(destAccount.getCountry()) ) {
            finInstnId2.setName(institutionName);
          }
          cdtrAgt.setFinancialInstitutionIdentification(finInstnId2);
          cdtTrfTxInf.setCreditorAgent(cdtrAgt);

          // Creditor
          net.nanopay.iso20022.PartyIdentification32 creditor = new net.nanopay.iso20022.PartyIdentification32();
          creditor.setName(getName(payee));
          if ( payeeAddress != null ) {
            net.nanopay.iso20022.PostalAddress6 pstlAdr2 = new net.nanopay.iso20022.PostalAddress6();

            String streetName = ""; ;
            String buildingNumber = "";

            if ( payeeAddress.getStructured() ) {
              streetName = payeeAddress.getStreetName() == null ? "" : payeeAddress.getStreetName();
              buildingNumber = payeeAddress.getStreetNumber() == null ? "" : payeeAddress.getStreetNumber();
            } else {
              var addr = AddressUtil.parseAddress(payeeAddress.getAddress1(), payeeAddress.getAddress2());
              streetName = addr[1];
              buildingNumber = addr[0];
            }

            pstlAdr2.setStreetName(removeSpecialChars(streetName.substring(0, Math.min(streetName.length(), 25))));
            pstlAdr2.setBuildingNumber(removeSpecialChars(buildingNumber.substring(0, Math.min(buildingNumber.length(), 10))));
            pstlAdr2.setPostCode(payeeAddress.getPostalCode());
            pstlAdr2.setTownName(payeeAddress.getCity());
            pstlAdr2.setCountrySubDivision(payeeAddress.getRegionId());
            pstlAdr2.setCountry(payeeAddress.getCountryId());
            creditor.setPostalAddress(pstlAdr2);
          }
          cdtTrfTxInf.setCreditor(creditor);

          // Creditor Account
          net.nanopay.iso20022.CashAccount16 cdtrAcct = new net.nanopay.iso20022.CashAccount16();
          net.nanopay.iso20022.AccountIdentification4Choice acctId2 = new net.nanopay.iso20022.AccountIdentification4Choice();
          net.nanopay.iso20022.GenericAccountIdentification1 acctOthr2 = new net.nanopay.iso20022.GenericAccountIdentification1();
          acctOthr2.setIdentification(destAccount.getAccountNumber());
          acctId2.setOthr(acctOthr2);
          cdtrAcct.setIdentification(acctId2);
          cdtTrfTxInf.setCreditorAccount(cdtrAcct);

          // Add credit message
          cdtTrfTxInfList.add(cdtTrfTxInf);
          transactionCount++;
          transactionVal = transactionVal + -txn.getTotal(x,txn.getSourceAccount()); // TODO should be getDestinationAmount for future USD purposes
          processedTransactions.add(txn);
        } catch ( Exception e ) {
          logger.error("Error when add transaction to RBC ISO20022 file", e);
          txn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent(e.getMessage()).build());
          txn.setStatus(TransactionStatus.FAILED);
          ((DAO) x.get("localTransactionDAO")).put(txn);
          Notification notification = new Notification.Builder(x)
            .setTemplate("NOC")
            .setBody("Failed to add transaction to RBC file: " + txn.getId() + " : " + e.getMessage() )
          .build();
          ((DAO) x.get("localNotificationDAO")).put(notification);
        }
      }

      if( transactionCount == 0 ) return null;
      grpHdr.setNumberOfTransactions(String.valueOf(transactionCount));
      grpHdr.setControlSum(toDecimal(transactionVal));
      cstmrCdtTrfInitn.setGroupHeader(grpHdr);

      pmtInf.setCreditTransferTransactionInformation(cdtTrfTxInfList.toArray(new net.nanopay.iso20022.CreditTransferTransactionInformation10[cdtTrfTxInfList.size()]));
      cstmrCdtTrfInitn.setPaymentInformation(new net.nanopay.iso20022.PaymentInstructionInformation3[]{pmtInf});
      pain00100103Msg.setCstmrCdtTrfInitn(cstmrCdtTrfInitn);

      coRecords.setCreditMsg(pain00100103Msg);
      coRecords.setTransactions(processedTransactions.toArray(new Transaction[processedTransactions.size()]));
      return coRecords;
      `
    },
    {
      name: 'generateCIRecords',
      type: 'net.nanopay.tx.rbc.iso20022file.RbcCIRecord',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'transactions', type: 'net.nanopay.tx.model.Transaction[]' },
        { name: 'batchFileId', type: 'String' },
      ],
      javaCode: `
      if( transactions == null || transactions.length < 1 ) return null;
      Logger logger = new PrefixLogger(new String[] {"RBC"}, (Logger) x.get("logger"));

      RbcCIRecord ciRecords = new RbcCIRecord();
      int transactionCount = 0;
      Long transactionVal = 0L;
      Transaction spidTxn = transactions[0];
      ServiceProvider spid = (ServiceProvider) ((DAO) x.get("localServiceProviderDAO")).find(spidTxn.getSpid());
      RbcAssignedClientValue rbcValues = (RbcAssignedClientValue) x.get("rbcAssignedClientValue");
      BankAccount fundingAccount = (BankAccount) ((DAO) x.get("accountDAO")).find(rbcValues.getAccountId());
      if ( fundingAccount == null ) throw new RuntimeException("Nanopay bank account cannot be null");

      net.nanopay.iso20022.Pain00800102 msg = new net.nanopay.iso20022.Pain00800102();
      net.nanopay.iso20022.CustomerDirectDebitInitiationV02 directDbtMsg = new net.nanopay.iso20022.CustomerDirectDebitInitiationV02();
      net.nanopay.iso20022.GroupHeader39 grpHdr = new net.nanopay.iso20022.GroupHeader39();
      grpHdr.setMessageIdentification(removeSpecialChars(batchFileId)); // MessageId mustbe unique within the last 180 days.
      Calendar created = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
      grpHdr.setCreationDateTime(created.getTime());

      net.nanopay.iso20022.PartyIdentification32 initgPty = new net.nanopay.iso20022.PartyIdentification32();
      net.nanopay.iso20022.Party6Choice id = new net.nanopay.iso20022.Party6Choice();
      net.nanopay.iso20022.OrganisationIdentification4  orgId = new net.nanopay.iso20022.OrganisationIdentification4();
      net.nanopay.iso20022.GenericOrganisationIdentification1 othr = new net.nanopay.iso20022.GenericOrganisationIdentification1();
      othr.setIssuer(spid.getPaymentIssuerTag());
      othr.setIdentification(rbcValues.getInitiatingPartyId()); // RBC will provide production and test IDs.
      orgId.setOther(new net.nanopay.iso20022.GenericOrganisationIdentification1[]{othr});
      id.setOrgId(orgId);
      initgPty.setIdentification(id);
      grpHdr.setInitiatingParty(initgPty);

      net.nanopay.iso20022.PaymentInstructionInformation4 pmtInf = new net.nanopay.iso20022.PaymentInstructionInformation4();
      pmtInf.setPaymentInformationIdentification("1"); // TODO is this ok since there's just one block of Payment Information
      pmtInf.setPaymentMethod(net.nanopay.iso20022.PaymentMethod2Code.DD);

      net.nanopay.iso20022.PaymentTypeInformation20 pmtTpInf = new net.nanopay.iso20022.PaymentTypeInformation20();
      net.nanopay.iso20022.ServiceLevel8Choice svcLvl = new net.nanopay.iso20022.ServiceLevel8Choice();
      svcLvl.setPrtry("NORM");
      pmtTpInf.setServiceLevel(svcLvl);
      pmtInf.setPaymentTypeInformation(pmtTpInf);
      pmtInf.setRequestedCollectionDate(created.getTime());

      // Creditor
      net.nanopay.iso20022.PartyIdentification32 creditor = new net.nanopay.iso20022.PartyIdentification32();
      creditor.setName("Nanopay Corporation"); // Hardcode this?
      // TODO Address is only required for US payments
      // if ( address != null ) {
      //   net.nanopay.iso20022.PostalAddress6 pstlAdr = new net.nanopay.iso20022.PostalAddress6();
      //   String streetName = address.getStreetName() == null ? "" : address.getStreetName();
      //   String buildingNumber = address.getStreetNumber() == null ? "" : address.getStreetNumber();
      //   pstlAdr.setStreetName(removeSpecialChars(streetName.substring(0, Math.min(streetName.length(), 25))));
      //   pstlAdr.setBuildingNumber(removeSpecialChars(buildingNumber.substring(0, Math.min(buildingNumber.length(), 10))));
      //   pstlAdr.setPostCode(address.getPostalCode());
      //   pstlAdr.setTownName(address.getCity());
      //   pstlAdr.setCountrySubDivision(address.getRegionId());
      //   pstlAdr.setCountry(address.getCountryId());
      //   creditor.setPostalAddress(pstlAdr);
      // }
      net.nanopay.iso20022.Party6Choice creditorId = new net.nanopay.iso20022.Party6Choice();
      net.nanopay.iso20022.OrganisationIdentification4  creditorOrgId = new net.nanopay.iso20022.OrganisationIdentification4();
      net.nanopay.iso20022.GenericOrganisationIdentification1 creditorOthr = new net.nanopay.iso20022.GenericOrganisationIdentification1();
      creditorOthr.setIdentification(rbcValues.getPAPAccountNumber()); // Grads Service Account Number supplied by RBC
      net.nanopay.iso20022.OrganisationIdentificationSchemeName1Choice schmeNm = new net.nanopay.iso20022.OrganisationIdentificationSchemeName1Choice();
      schmeNm.setCd("BANK");
      creditorOthr.setSchemeName(schmeNm);
      creditorOthr.setIssuer(spid.getPaymentIssuerTag());
      creditorOrgId.setOther(new net.nanopay.iso20022.GenericOrganisationIdentification1[]{creditorOthr});
      creditorId.setOrgId(creditorOrgId);
      creditor.setIdentification(creditorId);
      pmtInf.setCreditor(creditor);

      //Creditor Account
      net.nanopay.iso20022.CashAccount16 cdtrAcct = new net.nanopay.iso20022.CashAccount16();
      net.nanopay.iso20022.AccountIdentification4Choice acctId2 = new net.nanopay.iso20022.AccountIdentification4Choice();
      net.nanopay.iso20022.GenericAccountIdentification1 acctOthr2 = new net.nanopay.iso20022.GenericAccountIdentification1();
      acctOthr2.setIdentification(fundingAccount.getAccountNumber()); // Debiting RBC DDA AccountNumber associated to the ACH product/service.
      acctId2.setOthr(acctOthr2);
      cdtrAcct.setIdentification(acctId2);
      cdtrAcct.setCurrency("CAD");
      pmtInf.setCreditorAccount(cdtrAcct);

      // Creditor Agent
      net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4 cdtrAgt = new net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4();
      net.nanopay.iso20022.FinancialInstitutionIdentification7 finInstnId2 = new net.nanopay.iso20022.FinancialInstitutionIdentification7();
      net.nanopay.iso20022.ClearingSystemMemberIdentification2 clrSysMmbId2 = new net.nanopay.iso20022.ClearingSystemMemberIdentification2();
      net.nanopay.iso20022.ClearingSystemIdentification2Choice clrSysId2 = new net.nanopay.iso20022.ClearingSystemIdentification2Choice();
      clrSysId2.setCd("CACPA");
      clrSysMmbId2.setClearingSystemIdentification(clrSysId2);

      String insNumber = "";
      String branchNum = "";
      String insName = "";
      Branch b = fundingAccount.findBranch(x);
      if ( b != null ) {
        branchNum = padLeftWithZeros(b.getBranchId(), 5);
        Institution inst = (Institution) b.findInstitution(x);
        if ( inst != null ) {
          insName = inst.getName();
          insNumber = padLeftWithZeros(inst.getInstitutionNumber(), 4);
        }
      }

      StringBuilder memId = new StringBuilder();
      memId.append(insNumber);
      memId.append(branchNum);
      clrSysMmbId2.setMemberIdentification(memId.toString());
      finInstnId2.setClearingSystemMemberIdentification(clrSysMmbId2);
      finInstnId2.setName(insName);
      cdtrAgt.setFinancialInstitutionIdentification(finInstnId2);
      pmtInf.setCreditorAgent(cdtrAgt);

      // Direct Debit Information
      List<net.nanopay.iso20022.DirectDebitTransactionInformation9> drctDbtTxInfList = new ArrayList<>();
      List<Transaction> processedTransactions = new ArrayList<>();
      for( Transaction txn : transactions ) {
        try{
          isValidTransaction(txn);
          txn = (Transaction) txn.fclone();
          BankAccount sourceAccount = (BankAccount) txn.findSourceAccount(x);
          User sender = sourceAccount.findOwner(x);
          Address senderAddress = sender.getAddress();
          Address payerBankAddress = sourceAccount.getBankAddress();

          net.nanopay.iso20022.DirectDebitTransactionInformation9 drctDbtTxInf = new net.nanopay.iso20022.DirectDebitTransactionInformation9();
          net.nanopay.iso20022.PaymentIdentification1 pmtId = new net.nanopay.iso20022.PaymentIdentification1();
          String refNumber = String.valueOf(getRefNumber(x, txn));
          pmtId.setEndToEndIdentification(refNumber);
          ((RbcTransaction)txn).setRbcReferenceNumber(refNumber);
          drctDbtTxInf.setPaymentIdentification(pmtId);
          net.nanopay.iso20022.PaymentTypeInformation20 pmtTpInf2 = new net.nanopay.iso20022.PaymentTypeInformation20();
          net.nanopay.iso20022.CategoryPurpose1Choice ctgyPurp = new net.nanopay.iso20022.CategoryPurpose1Choice();
          ctgyPurp.setCd(this.getCategoryPurposeCodes(x, txn, logger));
          pmtTpInf2.setCategoryPurpose(ctgyPurp);
          drctDbtTxInf.setPaymentTypeInformation(pmtTpInf2);

          net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount instdAmt = new net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount();
          instdAmt.setCcy(txn.getDestinationCurrency());
          instdAmt.setText(toDecimal(-txn.getTotal(x, txn.getSourceAccount())));
          drctDbtTxInf.setInstructedAmount(instdAmt);

          // Debtor Agent
          net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4 dbtrAgt = new net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4();
          net.nanopay.iso20022.FinancialInstitutionIdentification7 finInstnId = new net.nanopay.iso20022.FinancialInstitutionIdentification7();
          net.nanopay.iso20022.ClearingSystemMemberIdentification2 clrSysMmbId = new net.nanopay.iso20022.ClearingSystemMemberIdentification2();
          net.nanopay.iso20022.ClearingSystemIdentification2Choice clrSysId = new net.nanopay.iso20022.ClearingSystemIdentification2Choice();
          clrSysId.setCd(sourceAccount.getCountry() + "CPA");
          clrSysMmbId.setClearingSystemIdentification(clrSysId);
          String institutionNumber = "";
          String branchNumber = "";
          String institutionName = "";
          Branch branch = sourceAccount.findBranch(x);
          if ( branch != null ) {
            branchNumber = padLeftWithZeros(branch.getBranchId(), 5);
            Institution institution = (Institution) branch.findInstitution(x);
            if ( institution != null ) {
              institutionName = institution.getName();
              institutionNumber = padLeftWithZeros(institution.getInstitutionNumber(), 4);
            }
          }
          clrSysMmbId.setMemberIdentification(institutionNumber + branchNumber);
          finInstnId.setClearingSystemMemberIdentification(clrSysMmbId);
          finInstnId.setName(institutionName);
          if ( "US".equals(sourceAccount.getCountry()) && payerBankAddress != null ) { // Bank address only mandatory for US
            net.nanopay.iso20022.PostalAddress6 pstlAdr2 = new net.nanopay.iso20022.PostalAddress6();
            String streetName = payerBankAddress.getStreetName() == null ? "" : payerBankAddress.getStreetName();
            String buildingNumber = payerBankAddress.getStreetNumber() == null ? "" : payerBankAddress.getStreetNumber();
            pstlAdr2.setStreetName(removeSpecialChars(streetName.substring(0, Math.min(streetName.length(), 25))));
            pstlAdr2.setBuildingNumber(removeSpecialChars(buildingNumber.substring(0, Math.min(buildingNumber.length(), 10))));
            pstlAdr2.setPostCode(payerBankAddress.getPostalCode());
            pstlAdr2.setTownName(payerBankAddress.getCity());
            pstlAdr2.setCountrySubDivision(payerBankAddress.getRegionId());
            pstlAdr2.setCountry(payerBankAddress.getCountryId());
            finInstnId.setPostalAddress(pstlAdr2);
          }
          dbtrAgt.setFinancialInstitutionIdentification(finInstnId);
          drctDbtTxInf.setDebtorAgent(dbtrAgt);

          // Debitor
          net.nanopay.iso20022.PartyIdentification32 debtor = new net.nanopay.iso20022.PartyIdentification32();
          debtor.setName(getName(sender));
          if ( senderAddress != null ) {
            net.nanopay.iso20022.PostalAddress6 pstlAdr3 = new net.nanopay.iso20022.PostalAddress6();
            String streetName = "";
            String buildingNumber = "";

            if ( senderAddress.getStructured() ) {
              streetName = senderAddress.getStreetName() == null ? "" : senderAddress.getStreetName();
              buildingNumber = senderAddress.getStreetNumber() == null ? "" : senderAddress.getStreetNumber();
            } else {
              var addr = AddressUtil.parseAddress(senderAddress.getAddress1(), senderAddress.getAddress2());
              streetName = addr[1];
              buildingNumber = addr[0];
            }

            pstlAdr3.setStreetName(removeSpecialChars(streetName.substring(0, Math.min(streetName.length(), 25))));
            pstlAdr3.setBuildingNumber(removeSpecialChars(buildingNumber.substring(0, Math.min(buildingNumber.length(), 10))));
            pstlAdr3.setPostCode(senderAddress.getPostalCode());
            pstlAdr3.setTownName(senderAddress.getCity());
            pstlAdr3.setCountrySubDivision(senderAddress.getRegionId());
            pstlAdr3.setCountry(senderAddress.getCountryId());
            debtor.setPostalAddress(pstlAdr3);
          }
          drctDbtTxInf.setDebtor(debtor);

          // Debitor Account
          net.nanopay.iso20022.CashAccount16 dbtrAcct = new net.nanopay.iso20022.CashAccount16();
          net.nanopay.iso20022.AccountIdentification4Choice acctId = new net.nanopay.iso20022.AccountIdentification4Choice();
          net.nanopay.iso20022.GenericAccountIdentification1 acctOthr = new net.nanopay.iso20022.GenericAccountIdentification1();
          acctOthr.setIdentification(sourceAccount.getAccountNumber());
          acctId.setOthr(acctOthr);
          dbtrAcct.setIdentification(acctId);
          dbtrAcct.setCurrency(txn.getSourceCurrency());
          drctDbtTxInf.setDebtorAccount(dbtrAcct);

          // Add debit message
          drctDbtTxInfList.add(drctDbtTxInf);
          transactionCount++;
          transactionVal = transactionVal + -txn.getTotal(x, txn.getSourceAccount());
          processedTransactions.add(txn);
        } catch ( Exception e ) {
          logger.error("Error when add transaction to RBC ISO20022 file", e);
          txn.getTransactionEvents(x).inX(x).put(new TransactionEvent.Builder(x).setEvent(e.getMessage()).build());
          txn.setStatus(TransactionStatus.FAILED);
          ((DAO) x.get("localTransactionDAO")).put(txn);
          Notification notification = new Notification.Builder(x)
            .setTemplate("NOC")
            .setBody("Failed to add transaction to RBC file: " + txn.getId() + " : " + e.getMessage() )
          .build();
          ((DAO) x.get("localNotificationDAO")).put(notification);
        }
      }

      if( transactionCount == 0 ) return null;
      grpHdr.setNumberOfTransactions(String.valueOf(transactionCount));
      grpHdr.setControlSum(toDecimal(transactionVal));
      directDbtMsg.setGroupHeader(grpHdr);

      pmtInf.setDirectDebitTransactionInformation(drctDbtTxInfList.toArray(new net.nanopay.iso20022.DirectDebitTransactionInformation9[drctDbtTxInfList.size()]));
      directDbtMsg.setPaymentInformation(new net.nanopay.iso20022.PaymentInstructionInformation4[]{pmtInf});
      msg.setCstmrDrctDbtInitn(directDbtMsg);

      ciRecords.setDebitMsg(msg);
      ciRecords.setTransactions(processedTransactions.toArray(new Transaction[processedTransactions.size()]));

      return ciRecords;
      `
    },
    {
      name: 'isValidTransaction',
      type: 'Boolean',
      args: [
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode:`
      if ( ! (transaction instanceof RbcCITransaction || transaction instanceof RbcCOTransaction || transaction instanceof RbcVerificationTransaction) ) {
        throw new ValidationException("Wrong transaction type");
      }

      if ( (! transaction.getSourceCurrency().equals("CAD") ) && (! transaction.getDestinationCurrency().equals("CAD")) ) {
        throw new ValidationException("Wrong currency type");
      }

      return true;
      `
    },
    {
      name: 'getRefNumber',
      type: 'Long',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode:`
      DAO refDAO = (DAO) x.get("rbcRefDAO");

      RbcReferenceNumber referenceNumber = new RbcReferenceNumber();
      referenceNumber.setTransactionId(transaction.getId());
      referenceNumber = (RbcReferenceNumber) refDAO.inX(x).put(referenceNumber);

      return referenceNumber.getId();
      `
    },
    {
      name: 'getName',
      type: 'String',
      args: [
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode:`
      String displayName = "";
      if( user == null ) return displayName;
      if ( ! SafetyUtil.isEmpty(user.getBusinessName()) ) {
        displayName = user.getBusinessName();
      } else if ( ! SafetyUtil.isEmpty(user.getOrganization()) ) {
        displayName = user.getOrganization();
      } else {
        displayName = user.getFirstName() + " " + user.getLastName();
      }
      return removeSpecialChars(displayName);
      `
    },
    {
      name: 'removeSpecialChars',
      type: 'String',
      args: [
        {
          name: 'str',
          type: 'String'
        },
      ],
      javaCode:`
      if( str == null ) return str;
      str = str.replaceAll("[^a-zA-Z0-9]", " ");
      return str;
      `
    },
    {
      name: 'padLeftWithZeros',
      type: 'String',
      args: [
        {
          name: 's',
          type: 'String'
        },
        {
          name: 'len',
          type: 'Integer'
        }
      ],
      javaCode:`
      return String.format("%" + len + "s", s).replace(' ', '0');
      `
    },
    {
      name: 'toDecimal',
      type: 'Double',
      args: [
        {
          name: 'amount',
          type: 'Long'
        },
      ],
      javaCode:`
      BigDecimal x100 = new BigDecimal(100);
      BigDecimal val = BigDecimal.valueOf(amount).setScale(2,BigDecimal.ROUND_HALF_DOWN);
      return val.divide(x100).setScale(2,BigDecimal.ROUND_HALF_DOWN).doubleValue();
      `
    },
    {
      name: 'getCategoryPurposeCodes',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        { name: 'transaction', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'logger', type: 'Logger' },
      ],
      javaCode:`
        RbcAssignedClientValue rbcValues = (RbcAssignedClientValue) x.get("rbcAssignedClientValue");
        Logger log = (Logger) x.get("logger");
        int padtype = 0;
        for ( var lItem : transaction.getLineItems() ) {
          if ( lItem instanceof PADTypeLineItem ) {
            padtype = (int) ((PADTypeLineItem) lItem).getPadType();
            break;
          }
        }
        switch ( padtype ) {
          case 200:
            return "SALA";
          case 230:
            return "PENS";
          case 250:
            return "DIVI";
          case 280:
            return "INTE";
          case 350:
            return "LOAN";
          case 380:
            return "TAXS";
          case 420:
            return "CASH";
          case 450:
            return "CASH";
          case 600:
            return "GOVT";
          default:
            logger.warning("Pad Type not found", padtype);
            return rbcValues.getDefaultPadType();
        }
      `
    }
  ]

});
