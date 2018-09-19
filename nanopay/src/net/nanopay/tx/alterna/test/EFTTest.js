foam.CLASS({
  package: 'net.nanopay.tx.alterna.test',
  name: 'EFTTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.lib.json.OutputterMode',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.cico.model.EFTConfirmationFileRecord',
    'net.nanopay.cico.model.EFTReturnRecord',
    'net.nanopay.tx.TransactionType',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.TransactionPlan',
    'net.nanopay.tx.alterna.*',
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

CABankAccount testBankAccount = createTestBankAccount(x);
DigitalAccount testDigitalAccount = createTestDigitalAccount(x, testBankAccount);
AlternaTransaction testAlternaTransaction = createTestTransaction(x, testBankAccount, testDigitalAccount);
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

completionTest(x, testBankAccount, testDigitalAccount);
    `
    },
    {
      name: 'createTestBankAccount',
      javaReturns: 'CABankAccount',
      args: [
        {
          name: 'x',
          javaType: 'X'
        }
      ],
      javaCode: `
DAO bankAccountDao = (DAO)x.get("accountDAO");

CABankAccount account = (CABankAccount) bankAccountDao.find(EQ(CABankAccount.NAME, "EFT Test Account"));

if ( account == null ) {
  BankAccount testBankAccount = new CABankAccount.Builder(x)
    .setAccountNumber("12345678")
    .setBranch(9)
    .setInstitution(4)
    .setOwner(1348)
    .setName("EFT Test Account")
    .setStatus(BankAccountStatus.VERIFIED)
    .build();

  return (CABankAccount) bankAccountDao.put(testBankAccount);
} else {
  return account;
}
    `
    },
    {
      name: 'createTestDigitalAccount',
      javaReturns: 'DigitalAccount',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          name: 'testBankAccount',
          javaType: 'CABankAccount'
        },
      ],
      javaCode: `
DAO userDAO        = (DAO) x.get("localUserDAO");
User user = (User) userDAO.find_(x, testBankAccount.getOwner());
return DigitalAccount.findDefault(x, user, "CAD");
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
          javaType: 'CABankAccount'
        },
        {
          name: 'testDigitalAccount',
          javaType: 'DigitalAccount'
        }
      ],
      javaCode: `
Logger logger = (Logger) x.get("logger");
DAO transactionDAO = (DAO)x.get("localTransactionDAO");
DAO planDAO = (DAO)x.get("localTransactionQuotePlanDAO");

Transaction requestTransaction = new Transaction.Builder(x)
  .setStatus(TransactionStatus.PENDING)
  .setAmount(12)
  //.setType(TransactionType.CASHIN)
  .setSourceAccount(testBankAccount.getId())
  .setDestinationAccount(testDigitalAccount.getId())
  .build();
TransactionQuote quote = new TransactionQuote.Builder(x).setRequestTransaction(requestTransaction).build();
quote = (TransactionQuote) planDAO.put(quote);
TransactionPlan plan = (TransactionPlan) quote.getPlan();
Transaction transaction = (Transaction) plan.getTransaction();
test ( transaction != null, "Plan transaction is not null");
test ( transaction instanceof AlternaTransaction, "Plan transaction instance of AlternaTransaction" );
logger.info("createTestTransaction bank", testBankAccount, "digital", testDigitalAccount);
if ( transaction != null &&
     transaction instanceof AlternaTransaction ) {
  return (AlternaTransaction) transactionDAO.put(transaction);
}
throw new RuntimeException("Plan transaction not instance of AlternaTransaction. transaction: "+transaction);
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

  EFTConfirmationFileProcessor.processTransaction(x, transactionDao, eftConfirmationFileRecord,
  eftUploadFileRecord,"UploadLog_test_B2B.csv.txt");

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

  EFTReturnFileProcessor.processTransaction(x, transactionDao, eftReturnRecord);

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
    },
    {
      name: 'completionTest',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          name: 'testBankAccount',
          javaType: 'CABankAccount'
        },
        {
          name: 'testDigitalAccount',
          javaType: 'DigitalAccount'
        }
      ],
      javaCode: `
Logger logger = (Logger) x.get("logger");
DAO transactionDAO = (DAO)x.get("localTransactionDAO");
AlternaTransaction txn = createTestTransaction(x, testBankAccount, testDigitalAccount);
txn.setStatus(TransactionStatus.SENT);
txn = (AlternaTransaction) transactionDAO.put_(x, txn);

TrustAccount trustAccount = TrustAccount.find(x, txn.findSourceAccount(x));
Long balanceBefore = (Long) trustAccount.findBalance(x);
logger.info("completionTest balance before", balanceBefore);
txn.setStatus(TransactionStatus.COMPLETED);
txn = (AlternaTransaction) transactionDAO.put_(x, txn);

Long balanceAfter = (Long) trustAccount.findBalance(x);
logger.info("completionTest balance after", balanceAfter, "amount", txn.getAmount());

test( balanceAfter != balanceBefore, "Trust Balance has changed");
test( balanceBefore - balanceAfter == txn.getAmount(), "Trust balance validated");
    `
    }
  ]
});
