foam.CLASS({
  package: 'net.nanopay.tx.tp.alterna.test',
  name: 'EFTTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.lib.json.OutputterMode',
    'foam.nanos.auth.User',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.cico.model.EFTConfirmationFileRecord',
    'net.nanopay.cico.model.EFTReturnRecord',
    'net.nanopay.tx.TransactionType',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.tp.alterna.*',
    'org.apache.commons.io.IOUtils',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.IOException',
    'java.io.InputStream',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'runTest',
      javaReturns: 'void',
      javaCode: `
DAO userDAO        = (DAO) x.get("localUserDAO");
    
BankAccount testBankAccount = createTestAccount(x);
AlternaTransaction testAlternaTransaction = createTestTransaction(x, testBankAccount);
User user = (User) userDAO.find_(x, testAlternaTransaction.findSourceAccount(x).getOwner());

String referenceNum = testAlternaTransaction.getId();
String firstName = user.getFirstName();
String lastName = user.getLastName();
Date now            = new Date();
String processDate = CsvUtil.csvSdf.get().format(CsvUtil.generateProcessDate(x, now));
String completionDate = CsvUtil.csvSdf.get().format(CsvUtil.generateCompletionDate(x, now));

String expectedCSV = "Business,"+user.getFirstName()+","+user.getLastName()+",00009,004,12345678,$0.12,DB,729,"+processDate+","+referenceNum;
String testConfirmationFile = "1|OK|25404857||Business|729|"+firstName+"|"+lastName+"|"+referenceNum;
String testUploadFile = "Business,"+firstName+","+lastName+",00009,004,12345678,$0.12,DB,729,"+processDate+","+referenceNum;
String testReturnFile = "25404857|"+referenceNum+"|905|"+completionDate+"|0.12|DB|"+firstName+"|"+lastName+"|12345678|004|00009";

CSVFileSendingTest(x, expectedCSV);
confirmationFileProcessingTest(x, testConfirmationFile, testUploadFile);
returnFileProcessingTest(x, testReturnFile);
    `
    },
    {
      name: 'createTestAccount',
      javaReturns: 'BankAccount',
      args: [
        {
          name: 'x',
          javaType: 'X'
        }
      ],
      javaCode: `
DAO bankAccountDao = (DAO)x.get("accountDAO");
BankAccount testBankAccount;
    
BankAccount account = (BankAccount) bankAccountDao.find(EQ(BankAccount.NAME, "EFT Test Account"));

if ( account == null ) {
  testBankAccount = new BankAccount.Builder(x)
    .setAccountNumber("12345678")
    .setBranch(9)
    .setInstitution(4)
    .setOwner(1348)
    .setName("EFT Test Account")
    .setStatus(BankAccountStatus.VERIFIED)
    .build();

  bankAccountDao.put(testBankAccount);
} else {
  testBankAccount = account;
}

return testBankAccount;
    `
    },
    {
      name: 'createTestTransaction',
      javaReturns: 'AlternaTransaction',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          name: 'testBankAccount',
          javaType: 'BankAccount'
        }
      ],
      javaCode: `
DAO transactionDao = (DAO)x.get("localTransactionDAO");

AlternaTransaction testAlternaTransaction = new AlternaTransaction.Builder(x)
  .setStatus(TransactionStatus.PENDING)
  .setAmount(12)
  .setType(TransactionType.CASHIN)
  .setSourceAccount(testBankAccount.getId())
  .setDestinationAccount(testBankAccount.getId())
  .build();

transactionDao.put(testAlternaTransaction);

return testAlternaTransaction;
    `
    },
    {
      name: 'CSVFileSendingTest',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          name: 'expectedCSV',
          javaType: 'String'
        }
      ],
      javaCode: `    
ByteArrayOutputStream baos = new ByteArrayOutputStream();
CsvUtil.writeCsvFile(x, baos, OutputterMode.STORAGE);

try {
  if ( IOUtils.toString(new ByteArrayInputStream(baos.toByteArray()),"UTF-8").contains(expectedCSV) ) {
    test(true, "CSV file is generated correctly");
  } else {
    test(false, "CSV file is not generated correctly");
  }
} catch (IOException e) {
  e.printStackTrace();
}
    `
    },
    {
      name: 'confirmationFileProcessingTest',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          name: 'testConfirmationFile',
          javaType: 'String'
        },
        {
          name: 'testUploadFile',
          javaType: 'String'
        }
      ],
      javaCode: `
DAO transactionDao = (DAO)x.get("localTransactionDAO");
        
InputStream confirmationFileStream = new ByteArrayInputStream(testConfirmationFile.getBytes());
EFTConfirmationFileParser eftConfirmationFileParser = new EFTConfirmationFileParser();
List<FObject> confirmationFile = eftConfirmationFileParser.parse(confirmationFileStream);

InputStream uploadFileStream = new ByteArrayInputStream(testUploadFile.getBytes());
EFTUploadCSVFileParser eftUploadCSVFileParser = new EFTUploadCSVFileParser();
List<FObject> uploadFileList = eftUploadCSVFileParser.parse(uploadFileStream);

for ( int i = 0; i < confirmationFile.size(); i++ ) {
  EFTConfirmationFileRecord eftConfirmationFileRecord = (EFTConfirmationFileRecord) confirmationFile.get(i);
  AlternaFormat eftUploadFileRecord = (AlternaFormat) uploadFileList.get(i);
  
  EFTConfirmationFileProcessor.processTransaction(transactionDao, eftConfirmationFileRecord,
  eftUploadFileRecord,"UploadLog_test_B2B.csv.txt", x);

  AlternaTransaction tran = (AlternaTransaction)transactionDao.find(EQ(Transaction.ID, eftConfirmationFileRecord.getReferenceId()));
  
  if ( tran != null ) {
    if ( TransactionStatus.SENT.equals(tran.getStatus()) ) {
      test(true, "Confirmation File Processing succeeded: Transaction " + tran.getId() + " state successfully changed from Pending to Sent");
    } else {
      test(false, "Confirmation File Processing failed: Transaction " + tran.getId());
    }
  }
}
    `
    },
    {
      name: 'returnFileProcessingTest',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          name: 'testReturnFile',
          javaType: 'String'
        }
      ],
      javaCode: `
DAO transactionDao = (DAO)x.get("localTransactionDAO");
    
InputStream returnFileStream = new ByteArrayInputStream(testReturnFile.getBytes());
EFTReturnFileParser eftReturnFileParser = new EFTReturnFileParser();
List<FObject> returnFile = eftReturnFileParser.parse(returnFileStream);

for ( FObject record : returnFile ) {
  EFTReturnRecord eftReturnRecord = (EFTReturnRecord) record;

  EFTReturnFileProcessor.processTransaction(transactionDao, eftReturnRecord, x);

  AlternaTransaction tran = (AlternaTransaction) transactionDao.find(EQ(Transaction.ID, eftReturnRecord.getExternalReference()));

  if ( tran != null ) {
    if ( TransactionStatus.DECLINED.equals(tran.getStatus()) && "Return".equals(tran.getReturnType()) ) {
      test(true, "Return File Processing succeeded: Transaction " + tran.getId() + " state successfully changed from Sent to Declined");
    } else {
      test(false, "Return File Processing failed: Transaction " + tran.getId());
    }
  }
}
    `
    }
  ]

});
