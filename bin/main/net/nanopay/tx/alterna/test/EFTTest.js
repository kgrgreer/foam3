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
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.cico.model.EFTConfirmationFileRecord',
    'net.nanopay.cico.model.EFTReturnRecord',
    'net.nanopay.cico.model.EFTReturnFileCredentials',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.alterna.*',
    'net.nanopay.tx.Transfer',
    'org.apache.commons.io.IOUtils',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.IOException',
    'java.io.InputStream',
    'java.io.PrintWriter',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.EQ',
    'net.nanopay.payment.Institution',
    'net.nanopay.model.Branch'
  ],

  methods: [
    {
      name: 'runTest',
      type: 'Void',
      javaCode: `
DAO userDAO        = (DAO) x.get("localUserDAO");

CABankAccount testBankAccount = createTestBankAccount(x);
DigitalAccount testDigitalAccount = createTestDigitalAccount(x, testBankAccount);
AlternaCITransaction testAlternaTransaction = createTestCITransaction(x, testBankAccount, testDigitalAccount);
User user = (User) userDAO.find_(x, testAlternaTransaction.findSourceAccount(x).getOwner());

String referenceNum = testAlternaTransaction.getId();
String firstName = user.getFirstName();
String lastName = user.getLastName();
Date now            = new Date();
String processDate = CsvUtil.csvSdf.get().format(CsvUtil.generateProcessDate(x, now));
String completionDate = CsvUtil.csvSdf.get().format(CsvUtil.generateCompletionDate(x, now));
boolean isOrganization = (user.getOrganization() != null && !user.getOrganization().isEmpty());

StringBuilder sb = new StringBuilder();
sb.append(isOrganization ? "Business," : "Personal,");
if ( SafetyUtil.isEmpty(user.getOrganization()) ) {
  sb.append(user.getFirstName());
  sb.append(",");
  sb.append(user.getLastName());
} else {
  sb.append(user.getOrganization());
  sb.append(",");  // Match CsvUtil behaviour
}
sb.append(",99999,999,12345678,$0.12,DB,729,");
sb.append(processDate);
sb.append(",");
sb.append(referenceNum);
CSVFileSendingTest(x, sb.toString());

String testConfirmationFile = "1|OK|25404857||Business|729|"+firstName+"|"+lastName+"|"+referenceNum;
String testUploadFile = "Business,"+firstName+","+lastName+",00009,004,12345678,$0.12,DB,729,"+processDate+","+referenceNum;
confirmationFileProcessingTest(x, testConfirmationFile, testUploadFile);

String testReturnFile = "25404857|"+referenceNum+"|905|"+completionDate+"|0.12|DB|"+firstName+"|"+lastName+"|12345678|004|00009";
returnFileProcessingTest(x, testReturnFile);

completionTest(x, testBankAccount, testDigitalAccount);
    `
    },
    {
      name: 'createTestBankAccount',
      type: 'net.nanopay.bank.CABankAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
DAO bankAccountDao = (DAO)x.get("accountDAO");

CABankAccount account = (CABankAccount) bankAccountDao.find(EQ(CABankAccount.NAME, "EFT Test Account"));

if ( account == null ) {

  final DAO  institutionDAO = (DAO) x.get("institutionDAO");
  final DAO  branchDAO      = (DAO) x.get("branchDAO");

  Institution institution = new Institution.Builder(x)
    .setInstitutionNumber("999")
    .setName("EFT Test institution")
    .build();
  institution = (Institution) institutionDAO.put_(x, institution);

  Branch branch = new Branch.Builder(x)
    .setBranchId("99999")
    .setInstitution(institution.getId())
    .build();
  branch = (Branch) branchDAO.put_(x, branch);

  BankAccount testBankAccount = new CABankAccount.Builder(x)
    .setAccountNumber("12345678")
    .setBranch( branch.getId() )
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
      type: 'net.nanopay.account.DigitalAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'testBankAccount',
          type: 'net.nanopay.bank.CABankAccount'
        },
      ],
      javaCode: `
DAO userDAO        = (DAO) x.get("localUserDAO");
User user = (User) userDAO.find_(x, testBankAccount.getOwner());
return DigitalAccount.findDefault(x, user, "CAD");
    `
    },
    {
      name: 'createTestCITransaction',
      type: 'net.nanopay.tx.alterna.AlternaCITransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'testBankAccount',
          type: 'net.nanopay.bank.CABankAccount'
        },
        {
          name: 'testDigitalAccount',
          type: 'net.nanopay.account.DigitalAccount'
        }
      ],
      javaCode: `
Logger logger = (Logger) x.get("logger");
DAO transactionDAO = (DAO)x.get("localTransactionDAO");
DAO planDAO = (DAO)x.get("localTransactionQuotePlanDAO");

Transaction requestTransaction = new Transaction.Builder(x)
  //.setStatus(TransactionStatus.PENDING)
  .setAmount(12)
  .setSourceAccount(testBankAccount.getId())
  .setDestinationAccount(testDigitalAccount.getId())
  .build();
TransactionQuote quote = new TransactionQuote.Builder(x).setRequestTransaction(requestTransaction).build();
quote = (TransactionQuote) planDAO.put(quote);
Transaction plan = (Transaction) quote.getPlan();
test ( plan != null, "Plan transaction is not null");
test ( plan instanceof AlternaCITransaction, "Plan transaction instance of AlternaCITransaction" );
//logger.info("createTestCITransaction bank", testBankAccount, "digital", testDigitalAccount);
if ( plan instanceof AlternaCITransaction ) {
System.out.println("createTEstCItransaction before initial put status: "+plan.getStatus());
  plan = (Transaction) transactionDAO.put(plan);
System.out.println("createTEstCItransaction after initial put status: "+plan.getStatus());
  return (AlternaCITransaction) plan;
}
throw new RuntimeException("Plan transaction not instance of AlternaCITransaction. transaction: "+plan);
    `
    },
    {
      name: 'CSVFileSendingTest',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'expectedCSV',
          type: 'String'
        }
      ],
      javaCode: `
ByteArrayOutputStream baos = new ByteArrayOutputStream();
PrintWriter printWriter = new PrintWriter(baos);
CsvUtil.writeCsvFile(x, printWriter, OutputterMode.STORAGE);

try {
  String response = IOUtils.toString(new ByteArrayInputStream(baos.toByteArray()),"UTF-8");
  if ( response.contains(expectedCSV)) {
    test(true, "CSV file is generated correctly");
  } else {
    test(false, "CSV file is not generated correctly");
    Logger logger = (Logger) x.get("logger");
    logger.error("CSVFileGeneration expected", expectedCSV);
    logger.error("CSVFileGeneration response", response);
  }
} catch (IOException e) {
  e.printStackTrace();
}
    `
    },
    {
      name: 'confirmationFileProcessingTest',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'testConfirmationFile',
          type: 'String'
        },
        {
          name: 'testUploadFile',
          type: 'String'
        }
      ],
      javaCode: `
DAO transactionDao = (DAO)x.get("localTransactionDAO");
EFTReturnFileCredentials credentials = (EFTReturnFileCredentials) x.get("EFTReturnFileCredentials");

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
  eftUploadFileRecord,"UploadLog_test_" + credentials.getIdentifier() + ".csv.txt");

  AlternaCITransaction tran = (AlternaCITransaction)transactionDao.find(EQ(Transaction.ID, eftConfirmationFileRecord.getReferenceId()));

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
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'testReturnFile',
          type: 'String'
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

  AlternaCITransaction tran = (AlternaCITransaction) transactionDao.find(EQ(Transaction.ID, eftReturnRecord.getExternalReference()));

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
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'testBankAccount',
          type: 'net.nanopay.bank.CABankAccount'
        },
        {
          name: 'testDigitalAccount',
          type: 'net.nanopay.account.DigitalAccount'
        }
      ],
      javaCode: `
Logger logger = (Logger) x.get("logger");
DAO transactionDAO = (DAO)x.get("localTransactionDAO");
AlternaCITransaction txn = createTestCITransaction(x, testBankAccount, testDigitalAccount);
txn.setStatus(TransactionStatus.SENT);
txn = (AlternaCITransaction) ((Transaction)transactionDAO.put_(x, txn)).fclone();
test(txn.getStatus() == TransactionStatus.SENT, "Transaction status SENT");
Account destAccount = txn.findDestinationAccount(x);
//Account destAcccount = (Account) ((DAO) x.get("localAccountDAO")).find_(x, txn.getSourceAccount());
Long destBalanceBefore = (Long) destAccount.findBalance(x);
TrustAccount trustAccount = TrustAccount.find(x, txn.findSourceAccount(x));
Long trustBalanceBefore = (Long) trustAccount.findBalance(x);
logger.info("completionTest trust balance before", trustBalanceBefore);
txn.setStatus(TransactionStatus.COMPLETED);
txn = (AlternaCITransaction) transactionDAO.put_(x, txn);
Long destBalanceAfter = (Long) destAccount.findBalance(x);
trustAccount = TrustAccount.find(x, txn.findSourceAccount(x));
Long trustBalanceAfter = (Long) trustAccount.findBalance(x);
logger.info("completionTest dest account balance: before", destBalanceBefore, "after", destBalanceAfter, "amount", txn.getAmount());
logger.info("completionTest trust account balance:  before", trustBalanceBefore, "after", trustBalanceAfter, "amount", txn.getAmount());
logger.info("transaction: "+txn);
Transfer[] transfers = txn.getTransfers();
logger.info("num transfers: ", transfers.length);
for (int i = 0; i < transfers.length; i++) {
  logger.info("transfer[", i, "]", transfers[i]);
}
test( trustBalanceAfter.longValue() != trustBalanceBefore.longValue(), "Trust Balance has changed");
logger.info("trustBalanceBefore - trustBalanceAfter", trustBalanceBefore - trustBalanceAfter);
test( trustBalanceBefore - trustBalanceAfter == txn.getAmount(), "Trust balance validated");
    `
    }
  ]
});
