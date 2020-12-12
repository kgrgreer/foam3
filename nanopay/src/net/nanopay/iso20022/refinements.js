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
  package: 'net.nanopay.iso20022',
  name: 'ISODateRefine',
  refines: 'net.nanopay.iso20022.ISODate',

  properties: [
    ['javaJSONParser', 'new net.nanopay.iso20022.ISODateParser()'],
    ['javaCSVParser',  'new net.nanopay.iso20022.ISODateParser()'],
    {
      name: 'toJSON',
      value: function toJSON(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'javaToCSV',
      value: 'outputter.outputValue(sdf.get().format(f(obj)));'
    }
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      // create SimpleDateFormatter field
      if ( ! info.fields ) info.fields = [];
      info.fields = [
        foam.java.Field.create({
          type: 'java.lang.ThreadLocal<java.text.SimpleDateFormat>',
          visibility: 'protected',
          final: true,
          name: 'sdf',
          initializer: `
            new java.lang.ThreadLocal<java.text.SimpleDateFormat>() {
              @Override
              protected java.text.SimpleDateFormat initialValue() {
                java.text.SimpleDateFormat df = new java.text.SimpleDateFormat("yyyy-MM-dd");
                df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                return df;
              }
            };
          `
        })
      ];

      info.method({
        name: 'toJSON',
        visibility: 'public',
        type: 'void',
        args: [
          { type: 'foam.lib.json.Outputter', name: 'outputter' },
          { type: 'Object',                  name: 'value'     },
        ],
        body: 'outputter.output(sdf.get().format(value));'
      });

      return info;
    },

    function formatDate(value) {
      // returns date in the following format: YYYY-MM-DD
      // pads month and date with leading zeros
      var year = value.getUTCFullYear();
      var month = value.getUTCMonth() + 1;
      month = ('00' + month).slice(-2);

      var date = value.getUTCDate();
      date = ('00' + date).slice(-2);

      return year + '-' + month + '-' + date;
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.iso20022',
  name: 'ISODateTimeRefine',
  refines: 'net.nanopay.iso20022.ISODateTime',

  properties: [
    ['javaJSONParser', 'new net.nanopay.iso20022.ISODateTimeParser()'],
    ['javaCSVParser',  'new net.nanopay.iso20022.ISODateTimeParser()'],
    {
      name: 'toJSON',
      value: function toJSON(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'javaToCSV',
      value: 'outputter.outputValue(sdf.get().format(f(obj)));'
    }
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      // create SimpleDateFormatter field
      if ( ! info.fields ) info.fields = [];
      info.fields = [
        foam.java.Field.create({
          type: 'java.lang.ThreadLocal<java.text.SimpleDateFormat>',
          visibility: 'protected',
          final: true,
          name: 'sdf',
          initializer: `
            new java.lang.ThreadLocal<java.text.SimpleDateFormat>() {
              @Override
              protected java.text.SimpleDateFormat initialValue() {
                java.text.SimpleDateFormat df = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
                df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                return df;
              }
            };
          `
        })
      ];

      info.method({
        name: 'toJSON',
        visibility: 'public',
        type: 'void',
        args: [
          { type: 'foam.lib.json.Outputter', name: 'outputter' },
          { type: 'Object',                  name: 'value'     },
        ],
        body: 'outputter.output(sdf.get().format(value));'
      });

      return info;
    },

    function formatDate(value) {
      // returns date in the following format: YYYY-MM-DD'T'HH:mm:ss.SSS+/-hh:mm
      // pads hour and minute in offset with leading zeros
      var isoString = value.toISOString();
      isoString = isoString.substring(0, isoString.length - 1);

      var timezoneOffset = value.getTimezoneOffset();
      if ( timezoneOffset < 0 ) {
        timezoneOffset *= -1
        isoString += '+';
      } else {
        isoString += '-';
      }

      // calculate hour and minute offset
      var hourOffset = ('00' + (Math.trunc(timezoneOffset / 60))).slice(-2);
      timezoneOffset = ('00' + (timezoneOffset - ( hourOffset * 60 ))).slice(-2);

      isoString += hourOffset + ':' + timezoneOffset;
      return isoString;
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.iso20022',
  name: 'ISOTimeRefine',
  refines: 'net.nanopay.iso20022.ISOTime',

  properties: [
    ['javaJSONParser', 'new net.nanopay.iso20022.ISOTimeParser()'],
    ['javaCSVParser',  'new net.nanopay.iso20022.ISOTimeParser()'],
    {
      name: 'toJSON',
      value: function toJSON(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'javaToCSV',
      value: 'outputter.outputValue(sdf.get().format(f(obj)));'
    },
  ],

  methods: [
    function createJavaPropertyInfo_(cls) {
      var info = this.SUPER(cls);

      // create SimpleDateFormatter field
      if ( ! info.fields ) info.fields = [];
      info.fields = [
        foam.java.Field.create({
          type: 'java.lang.ThreadLocal<java.text.SimpleDateFormat>',
          visibility: 'protected',
          final: true,
          name: 'sdf',
          initializer: `
            new java.lang.ThreadLocal<java.text.SimpleDateFormat>() {
              @Override
              protected java.text.SimpleDateFormat initialValue() {
                java.text.SimpleDateFormat df = new java.text.SimpleDateFormat("HH:mm:ss.SSS'Z'");
                df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
                return df;
              }
            };
          `
        })
      ];

      info.method({
        name: 'toJSON',
        visibility: 'public',
        type: 'void',
        args: [
          { type: 'foam.lib.json.Outputter', name: 'outputter' },
          { type: 'Object',                  name: 'value'     },
        ],
        body: 'outputter.output(sdf.get().format(value));'
      });

      return info;
    },

    function formatDate(value) {
      // returns date in the following format: HH:mm:ss.SSS'Z'
      // pads all values with leading zeros
      var hours = value.getUTCHours();
      hours = ('00' + hours).slice(-2);

      var minutes = value.getUTCMinutes();
      minutes = ('00' + minutes).slice(-2);

      var seconds = value.getUTCSeconds();
      seconds = ('00' + seconds).slice(-2);

      var milliseconds = value.getUTCMilliseconds();
      milliseconds = ('000' + milliseconds).slice(-3);

      return hours + ':' + minutes + ':' + seconds + '.' + milliseconds + 'Z';
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.iso20022',
  name: 'Pacs00800106Refine',
  refines: 'net.nanopay.iso20022.Pacs00800106',

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'net.nanopay.tx.TransactionDAO',
    'net.nanopay.tx.PacsTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionEntity',
    'net.nanopay.tx.model.TransactionStatus',

    'java.io.*',
    'java.util.Date',

    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.core.FObject',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'generatePacs002Msgby008Msg',

        type: 'net.nanopay.iso20022.Pacs00200109',
        javaCode: `
          PrintWriter out = getX().get(PrintWriter.class);
          Logger logger   = (Logger) getX().get("logger");

          Pacs00200109 pacs00200109 = new Pacs00200109();
          pacs00200109.setX(getX());

          String spId = "nanopay";

          FIToFIPaymentStatusReportV09 fIToFIPmtStsRpt = new FIToFIPaymentStatusReportV09();

          GroupHeader53 grpHdr53 = new GroupHeader53();
          grpHdr53.setMessageIdentification(java.util.UUID.randomUUID().toString().replace("-", ""));
          grpHdr53.setCreationDateTime(new Date());

          if ( this.getFIToFICstmrCdtTrf() != null ) {
            if ( this.getFIToFICstmrCdtTrf().getGroupHeader() == null ) {
              throw new RuntimeException("Missing field : GroupHeader");
            }
            if ( this.getFIToFICstmrCdtTrf().getGroupHeader().getMessageIdentification() == null ) {
              throw new RuntimeException("Missing field : MessageIdentification");
            }
            if ( this.getFIToFICstmrCdtTrf().getGroupHeader().getCreationDateTime() == null ) {
              throw new RuntimeException("Missing field : CreationDateTime");
            }
            if ( this.getFIToFICstmrCdtTrf().getGroupHeader().getNumberOfTransactions() == null ) {
              throw new RuntimeException("Missing field : NumberOfTransactions");
            }

            if ( this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation() != null ) {

              int length_ = this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation().length;
              pacs00200109.setFIToFIPmtStsRpt(fIToFIPmtStsRpt);
              pacs00200109.getFIToFIPmtStsRpt().setTransactionInformationAndStatus(new PaymentTransaction91[length_]);
              pacs00200109.getFIToFIPmtStsRpt().setOriginalGroupInformationAndStatus(new OriginalGroupHeader13[length_]);
              pacs00200109.getFIToFIPmtStsRpt().setGroupHeader(grpHdr53);

              DAO userDAO        = (DAO) getX().get("userDAO");
              DAO accountDAO     = (DAO) getX().get("accountDAO");
              DAO branchDAO      = (DAO) getX().get("branchDAO");
              DAO institutionDAO = (DAO) getX().get("institutionDAO");
              DAO txnDAO         = (DAO) getX().get("transactionDAO");

              for ( int i = 0 ; i < length_ ; i++ ) {
                String addrLine   = "";
                long senderId     = 0 ;
                long receiverId   = 0;
                String senderBkId   = "";
                String receiverBkId = "";
                String txnId = null;

                FObject fObjSender       = null;
                FObject fObjSenderBk     = null;
                FObject fObjReceiver     = null;
                FObject fObjReceiverBk   = null;
                FObject fObjTxn          = null;

                User sender   = null;
                User receiver = null;
                CABankAccount senderBankAcct   = null;
                INBankAccount receiverBankAcct = null;
                Transaction transaction = null;

                try {
                  if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor() != null ) {
                    sender = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getContactDetails().getEmailAddress()));

                    // Create a Sender
                    if ( sender == null ) {
                      sender = new User();

                      sender.setEmail((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getContactDetails().getEmailAddress());

                      sender.setPhoneNumber(((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getContactDetails().getPhoneNumber()).replace(String.valueOf('-'), ""));
                      sender.setPhoneNumberVerified(true);

                      sender.setEmailVerified(true);
                      sender.setFirstName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getName());
                      sender.setLastName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getName());
                      sender.setBirthday((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getIdentification().getPrvtId().getDateAndPlaceOfBirth().getBirthDate());
                      sender.setGroup("system");
                      sender.setSpid(spId);
                      // REVIEW: removed with User/Business split
                      // sender.setBusinessTypeId(0);
                      // sender.setBusinessSectorId(1);
                      // sender.setStatus("Active");
                      // sender.setOnboarded(true);

                      Address senderAddress = new Address();
                      addrLine = "";

                      if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getStreetName() != null ||
                            ((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getStreetName()).equals("") ) {  //structured
                        senderAddress.setStructured(true);
                        senderAddress.setStreetName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getStreetName());
                        senderAddress.setSuite((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getBuildingNumber());
                      } else {
                        for ( int j = 0; j < (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getAddressLine().length; j++ ) {
                          addrLine += (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getAddressLine()[j] + " ";
                        }

                        senderAddress.setAddress1(addrLine);
                      }
                      senderAddress.setCity((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getTownName());
                      senderAddress.setCountryId((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getCountry());
                      senderAddress.setRegionId((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getCountrySubDivision());
                      senderAddress.setPostalCode((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getPostalAddress().getPostCode());

                      sender.setAddress(senderAddress);

                      fObjSender = userDAO.put(sender);

                      if ( fObjSender instanceof FObject )
                      senderId = ((User)fObjSender).getId();

                      // Create a Sender's BankAccount
                      if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAccount() != null ) {
                        senderBankAcct = new CABankAccount();

                        senderBankAcct.setId(String.valueOf(senderId));
                        senderBankAcct.setName(senderId + "Account");
                        senderBankAcct.setX(getX());
                        senderBankAcct.setOwner(senderId);
                        senderBankAcct.setAccountNumber((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                        senderBankAcct.setDenomination((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getInstructedAmount().getCcy());

                        Institution institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER, (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification()));
                        if ( institution != null ) {
                          senderBankAcct.setInstitutionNumber(String.valueOf(institution.getInstitutionNumber()));
                        } else {
                          logger.warning("generatePacs002Msgby008Msg", "Unknown Institution", (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                        }

                        Branch branch = (Branch) branchDAO.find(EQ(Branch.BRANCH_ID, (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAgent().getBranchIdentification().getIdentification()));
                        if ( branch != null ) {
                          senderBankAcct.setBranchId(String.valueOf(branch.getBranchId()));
                        } else {
                          logger.warning("generatePacs002Msgby008Msg", "Unknown Branch", (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAgent().getBranchIdentification().getIdentification(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                        }
                        senderBankAcct.setStatus(BankAccountStatus.VERIFIED);
                        senderBankAcct.setVerificationAttempts(1);
                        senderBankAcct.setIsDefault(true);

                        fObjSenderBk = accountDAO.put(senderBankAcct);

                        if ( fObjSenderBk instanceof FObject )
                          senderBkId = ((BankAccount)fObjSenderBk).getId();

                      } else {
                        throw new RuntimeException("Missing field : DbtrAcct");
                      }
                    } else {
                       sender = (User)userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getContactDetails().getEmailAddress()));
                       senderId = sender.getId();
                       sender.setDeleted(false);
                    }
                  } else {
                    throw new RuntimeException("Missing field : Dbtr");
                  }

                  if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor() != null ) {
                    receiver = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getContactDetails().getEmailAddress()));

                    // Create a Receiver
                    if ( receiver == null ) {
                      receiver = new User();

                      receiver.setEmail((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getContactDetails().getEmailAddress());

                      receiver.setPhoneNumber(((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getContactDetails().getPhoneNumber()).replace(String.valueOf('-'), ""));
                      receiver.setPhoneNumberVerified(true);

                      receiver.setEmailVerified(true);
                      receiver.setFirstName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getName());
                      receiver.setLastName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getName());
                      receiver.setBirthday((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getIdentification().getPrvtId().getDateAndPlaceOfBirth().getBirthDate());
                      receiver.setGroup("system");
                      receiver.setSpid(spId);
                       // REVIEW: removed with User/Business split
                      // receiver.setBusinessTypeId(0);
                      // receiver.setBusinessSectorId(1);
                      //receiver.setStatus("Active");
                      //receiver.setOnboarded(true);

                      Address receiverAddress = new Address();
                      addrLine = "";

                      if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getStreetName() != null ||
                             ((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getStreetName()).equals("") ) {  //structured
                        receiverAddress.setStructured(true);
                        receiverAddress.setStreetName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getStreetName());
                        receiverAddress.setSuite((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getBuildingNumber());
                      } else {
                        for ( int j = 0; j < (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getAddressLine().length; j++ ) {
                          addrLine += (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getAddressLine()[j] + " ";
                        }

                        receiverAddress.setAddress1(addrLine);
                      }
                      receiverAddress.setCity((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getTownName());
                      receiverAddress.setCountryId((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getCountry());
                      receiverAddress.setRegionId((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getCountrySubDivision());
                      receiverAddress.setPostalCode((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getPostalAddress().getPostCode());

                      receiver.setAddress(receiverAddress);

                      fObjReceiver = userDAO.put(receiver);

                      if ( fObjReceiver instanceof FObject )
                        receiverId = ((User)fObjReceiver).getId();

                      // Create a Receiver's BankAccount
                      if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditorAccount() != null ) {
                        receiverBankAcct = new INBankAccount();
                        receiverBankAcct.setId(String.valueOf(receiverId));
                        receiverBankAcct.setName(receiverId + "Account");
                        receiverBankAcct.setX(getX());
                        receiverBankAcct.setOwner(receiverId);
                        receiverBankAcct.setAccountNumber((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditorAccount().getIdentification().getOthr().getIdentification());
                        receiverBankAcct.setDenomination((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getInterbankSettlementAmount().getCcy());
                        // receiverBankAcct.setInstitution((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification());
                        // receiverBankAcct.setBranch((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditorAgent().getBranchIdentification().getIdentification());

                          Institution institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER, (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification()));
                          if ( institution != null ) {
                            receiverBankAcct.setInstitutionNumber(String.valueOf(institution.getInstitutionNumber()));
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Institution", (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                          }

                          Branch branch = (Branch) branchDAO.find(EQ(Branch.BRANCH_ID, (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditorAgent().getBranchIdentification().getIdentification()));
                          if ( branch != null ) {
                            receiverBankAcct.setBranchId(String.valueOf(branch.getBranchId()));
                          } else {
                            logger.warning("generatePacs002Msgby008Msg", "Unknown Branch", (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditorAgent().getFinancialInstitutionIdentification().getClearingSystemMemberIdentification().getMemberIdentification(), "sender", String.valueOf(senderId), "accountNumber", (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtorAccount().getIdentification().getOthr().getIdentification());
                          }

                        receiverBankAcct.setStatus(BankAccountStatus.VERIFIED);
                        receiverBankAcct.setVerificationAttempts(1);
                        receiverBankAcct.setIsDefault(true);

                        fObjReceiverBk = accountDAO.put(receiverBankAcct);

                        if ( fObjReceiverBk instanceof FObject )
                          receiverBkId = ((BankAccount)fObjReceiverBk).getId();

                      } else {
                        throw new RuntimeException("Missing field : CreditorAccount");
                      }
                  } else {
                    receiver = (User) userDAO.find(EQ(User.EMAIL, (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getContactDetails().getEmailAddress()));
                    receiverId = receiver.getId();
                    receiver.setDeleted(false);
                  }
                } else {
                  throw new RuntimeException("Missing field : Creditor");
                }

                  //Create a Transaction
                  if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getInstructedAmount() != null ) {
                    double txAmt = (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getInstructedAmount().getText();
                    long longTxAmt = Math.round(txAmt);

                    //(this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getContactDetails().setPhoneNumber(((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getContactDetails().getPhoneNumber()).replace("+", "\\\\"));

                      //= ((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getContactDetails().getPhoneNumber()).replace("+", "\\\\");
                    //(this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getContactDetails().setPhoneNumber(((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getContactDetails().getPhoneNumber()).replace("+", "\\\\"));
                      //= ((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getContactDetails().getPhoneNumber()).replace("+", "\\\\");

                    TransactionEntity payer = new TransactionEntity.Builder(getX())
                      .setId(senderId)
                      .setFirstName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getName())
                      .setLastName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getName())
                      .setFullName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getName())
                      .setEmail((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getDebtor().getContactDetails().getEmailAddress())
                      .build();

                    TransactionEntity payee = new TransactionEntity.Builder(getX())
                      .setId(receiverId)
                      .setFirstName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getName())
                      .setLastName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getName())
                      .setFullName((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getName())
                      .setEmail((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getCreditor().getContactDetails().getEmailAddress())
                      .build();

                    long desAmt = new Double((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getInterbankSettlementAmount().getText()).longValue();
                    transaction = new PacsTransaction.Builder(getX())
                      .setName("Digital Transfer from PACS")
                      // REVIEW: ACSP and ACSC are pacs status, but not transaction status.
                      //.setStatus(TransactionStatus.ACSP)

                      .setSourceCurrency((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getInstructedAmount().getCcy())
                      .setSourceAccount(senderBkId)

                      .setDestinationCurrency((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getInterbankSettlementAmount().getCcy())
                      .setDestinationAmount(desAmt)
                      .setDestinationAccount(receiverBkId)

                      .setAmount(longTxAmt)
                      .setMessageId(this.getFIToFICstmrCdtTrf().getGroupHeader().getMessageIdentification())
                      .build();

                      // Add the pacs message to the reference data
                      transaction.getExternalData().put("Digital Transfer from PACS", this);

                      fObjTxn = txnDAO.put(transaction);

                      if ( fObjTxn instanceof FObject )
                        txnId = ((Transaction)fObjTxn).getId();

                  } else {
                    throw new RuntimeException("Missing field : InstdAmt");
                  }

                  if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getPaymentIdentification() != null ) {
                    if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getPaymentIdentification().getEndToEndIdentification() == null ) {
                      throw new RuntimeException("Missing field : EndToEndId");
                    }

                    if ( (this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getPaymentIdentification().getTransactionIdentification() == null ) {
                      throw new RuntimeException("Missing field : TransactionIdentification");
                    }

                    String strStatus = "ACSP";

                    PaymentTransaction91 paymentTransaction91 = new PaymentTransaction91();

                    paymentTransaction91.setStatusIdentification(java.util.UUID.randomUUID().toString().replace("-", ""));
                    paymentTransaction91.setOriginalEndToEndIdentification((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getPaymentIdentification().getEndToEndIdentification());
                    paymentTransaction91.setOriginalTransactionIdentification((this.getFIToFICstmrCdtTrf().getCreditTransferTransactionInformation())[i].getPaymentIdentification().getTransactionIdentification());
                    paymentTransaction91.setTransactionStatus(strStatus);  // ACSP or ACSC

                    pacs00200109.getFIToFIPmtStsRpt().getTransactionInformationAndStatus()[i] = paymentTransaction91;

                    OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();

                    orgnlGrpInfAndSts.setOriginalMessageIdentification(this.getFIToFICstmrCdtTrf().getGroupHeader().getMessageIdentification());
                    orgnlGrpInfAndSts.setOriginalCreationDateTime(this.getFIToFICstmrCdtTrf().getGroupHeader().getCreationDateTime());
                    orgnlGrpInfAndSts.setOriginalMessageNameIdentification("Pacs.008.001.06");
                    orgnlGrpInfAndSts.setOriginalNumberOfTransactions(this.getFIToFICstmrCdtTrf().getGroupHeader().getNumberOfTransactions());
                    orgnlGrpInfAndSts.setOriginalControlSum(this.getFIToFICstmrCdtTrf().getGroupHeader().getControlSum());
                    orgnlGrpInfAndSts.setGroupStatus(strStatus);

                    pacs00200109.getFIToFIPmtStsRpt().getOriginalGroupInformationAndStatus()[i] = orgnlGrpInfAndSts;
                  } else {
                    throw new RuntimeException("Missing field : PmtId");
                  }
                 } catch ( Throwable t ) {
                    logger.debug("sernderId", senderId);
                    logger.debug("receiverId", receiverId);
                    logger.debug("senderBkId", senderBkId);
                    logger.debug("receiverBkId", receiverBkId);
                    logger.debug("fObjTxn", txnId);

                    if ( fObjSender instanceof FObject ) {
                      sender = (User)userDAO.find(senderId);
                      userDAO.remove(sender);
                    }

                    if ( fObjSenderBk instanceof FObject ) {
                      senderBankAcct = (CABankAccount)accountDAO.find(senderBkId);
                      accountDAO.remove(senderBankAcct);
                    }

                    if ( fObjReceiver instanceof FObject ) {
                      receiver = (User)userDAO.find(receiverId);
                      userDAO.remove(receiver);
                    }

                    if ( fObjReceiverBk instanceof FObject ) {
                      receiverBankAcct = (INBankAccount)accountDAO.find(receiverBkId);
                      accountDAO.remove(receiverBankAcct);
                    }

                    if ( fObjTxn instanceof FObject ) {
                      transaction = (Transaction)txnDAO.find(txnId);
                      txnDAO.remove(transaction);   // OR changing its status not removing the data
                    }

                    out.println("Error " + t);
                    out.println("<pre>");
                    t.printStackTrace(out);
                    out.println("</pre>");
                    logger.error(t);
                }
             }
         } else {
           throw new RuntimeException("Missing field : CreditTransferTransactionInformation");
         }
       } else {
         throw new RuntimeException("Missing field : FIToFICstmrCdtTrf");
       }

          return pacs00200109;
          `
      }
  ]

});


foam.CLASS({
  package: 'net.nanopay.iso20022',
  name: 'Pacs02800101Refine',
  refines: 'net.nanopay.iso20022.Pacs02800101',

  javaImports: [
    'net.nanopay.tx.TransactionDAO',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.PacsTransaction',
    'net.nanopay.tx.model.TransactionStatus',

    'java.io.*',
    'java.util.Date',

    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.EQ',
  ],

  methods: [
      {
        name: 'generatePacs002Msgby028Msg',

          type: 'net.nanopay.iso20022.Pacs00200109',
          javaCode: `
            PrintWriter out = getX().get(PrintWriter.class);
            Logger logger   = (Logger) getX().get("logger");

            Pacs00200109 pacs00200109 = new Pacs00200109();
            pacs00200109.setX(getX());

            FIToFIPaymentStatusReportV09 fIToFIPmtStsRpt = new FIToFIPaymentStatusReportV09();

            GroupHeader53 grpHdr53 = new GroupHeader53();
            grpHdr53.setMessageIdentification(java.util.UUID.randomUUID().toString().replace("-", ""));
            grpHdr53.setCreationDateTime(new Date());

            int length_ = this.getFIToFIPmtStsReq().getOriginalGroupInformation().length;
            pacs00200109.setFIToFIPmtStsRpt(fIToFIPmtStsRpt);
            pacs00200109.getFIToFIPmtStsRpt().setOriginalGroupInformationAndStatus(new OriginalGroupHeader13[length_]);
            pacs00200109.getFIToFIPmtStsRpt().setGroupHeader(grpHdr53);

            if ( this.getFIToFIPmtStsReq() == null ) {
              throw new RuntimeException("Missing field : FIToFIPmtStsReq");
            }

            DAO txnDAO = (DAO) getX().get("transactionDAO");

            try {
              for ( int i = 0 ; i < length_ ; i++ ) {
                if ( (this.getFIToFIPmtStsReq().getOriginalGroupInformation())[i] != null ) {
                  OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();

                  if ( (this.getFIToFIPmtStsReq().getOriginalGroupInformation())[i].getOriginalMessageIdentification() != null && (this.getFIToFIPmtStsReq().getOriginalGroupInformation())[i].getOriginalCreationDateTime() != null ) {
                    //Transaction txn = (Transaction) txnDAO.find((this.getFIToFIPmtStsReq().getOriginalGroupInformation())[i].getOriginalMessageIdentification());
                    Transaction txn = (Transaction) txnDAO.find(EQ(PacsTransaction.MESSAGE_ID, (this.getFIToFIPmtStsReq().getOriginalGroupInformation())[i].getOriginalMessageIdentification()));

                    TransactionStatus cur_txnStatus = null;
                    String txnStatus  = null;

                    if ( txn != null ) {
                      cur_txnStatus = (TransactionStatus)txn.getStatus();
                      System.out.println("txn.getStatus() : " + txn.getStatus());
                      System.out.println("txn.getStatus().getName() : " + txn.getStatus().getName());

                      if ( cur_txnStatus.equals(TransactionStatus.COMPLETED) ) {
                        txnStatus = "ACSP"; //TransactionStatus.ACSP;
                      } else {
                        txnStatus = "ACSC"; //TransactionStatus.ACSC;
                      }

                    } else {
                      throw new RuntimeException("Transaction with the Original Message Id not found");
                    }

                    orgnlGrpInfAndSts.setOriginalMessageIdentification((this.getFIToFIPmtStsReq().getOriginalGroupInformation())[i].getOriginalMessageIdentification());
                    orgnlGrpInfAndSts.setOriginalCreationDateTime((this.getFIToFIPmtStsReq().getOriginalGroupInformation())[i].getOriginalCreationDateTime());
                    orgnlGrpInfAndSts.setOriginalMessageNameIdentification("Pacs.008.001.06");
                    orgnlGrpInfAndSts.setGroupStatus(txnStatus);   // ACSP or ACSC
                    pacs00200109.getFIToFIPmtStsRpt().getOriginalGroupInformationAndStatus()[i] = orgnlGrpInfAndSts;
                  } else {
                    throw new RuntimeException("Missing field : OriginalMessageIdentification OR OriginalCreationDateTime");
                  }
                } else {
                  throw new RuntimeException("Missing field : OriginalGroupInformation");
                }
              }
             } catch ( Throwable t ) {
              out.println("Error " + t);
              out.println("<pre>");
              t.printStackTrace(out);
              out.println("</pre>");
              logger.error(t);
             }

            return pacs00200109;
            `
        }
  ]
});

foam.CLASS({
  package: 'net.nanopay.iso20022',
  name: 'PhoneNumberRefine',
  refines: 'net.nanopay.iso20022.PhoneNumber',

  properties: [
    {
      class: "String",
      name: "javascriptPattern",
      value: "^\\+[0-9]{1,3}-[0-9()+\\-]{1,30}$"
    },
    {
			name: "assertValue",
			value: function (value, prop) {
          if ( ( prop.minLength || prop.minLength === 0 ) && value.length < prop.minLength )
            throw new Error(prop.name);
          if ( ( prop.maxLength || prop.maxLength === 0 ) && value.length > prop.maxLength )
            throw new Error(prop.name);
          if ( prop.javascriptPattern && ! new RegExp(prop.javascriptPattern, 'g').test(value) )
            throw new Error(prop.name);
        }
		}
  ]
});
