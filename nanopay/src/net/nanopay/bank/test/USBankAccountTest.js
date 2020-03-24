foam.CLASS({
  package: 'net.nanopay.bank.test',
  name: 'USBankAccountTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.test.Test',
    'foam.test.TestUtils',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.USBankAccount',


    'foam.dao.ArraySink',
    'net.nanopay.model.Branch',
    'java.util.List',
//    'foam.nanos.fs.FileProperty',
    'java.io.*',
    'foam.blob.BlobService',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.NetworkPropertyPredicate',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.*',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
//    'foam.nanos.fs.File',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'javax.imageio.ImageIO',


  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        DAO localAccountDAO = (DAO) x.get("localAccountDAO");
        User testUser = TestUtils.createTestUser();
        testUser.setEmailVerified(true);
        testUser.setId(0);
        testUser = (User) (((DAO) x.get("bareUserDAO")).put(testUser));
        String branchId = "123412345";
        String accountId = "9999811";
        String accountName = "Vasyan";
        foam.nanos.fs.File file = populateCheckImg(x);
        BankAccount bankAccount = new USBankAccount.Builder(x)
                                      .setBranchId(branchId)
                                      .setAccountNumber(accountId)
                                      .setOwner(testUser.getId())
                                      .setName(accountName)
                                      .setCountry("US")
                                      .setVoidCheckImage(file)
                                      .build();
        bankAccount = (BankAccount) localAccountDAO.put(bankAccount);

        bankAccount.setBranchId("123331234");
        bankAccount.setSummary("Empty");
        bankAccount = (BankAccount) localAccountDAO.put(bankAccount);



        GTest(x);
      `
    },
    {
      name: 'GTest',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        Branch branch;
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        DAO branchDAO = (DAO) x.get("branchDAO");
        List usAccounts = ((ArraySink) accountDAO.where(foam.mlang.MLang.EQ(net.nanopay.bank.USBankAccount.COUNTRY, "US")).select(new ArraySink())).getArray();
        for ( Object usAccount : usAccounts ) {
          branch = new Branch.Builder(x).setBranchId(((BankAccount) usAccount).getBranchId()).build();
          branchDAO.put(branch);
          BankAccount newaccount = (BankAccount) ((BankAccount) usAccount).fclone();
          newaccount.setBranch(branch.getId());
          accountDAO.put(newaccount);
        }
        test(true, "hello");
      `
    },
    {
      name: 'populateCheckImg',
      type: 'foam.nanos.fs.File',
      args:
      [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        java.io.File file = new java.io.File("/Users/mykola/Desktop/testimg.png");
        java.awt.image.BufferedImage image = null;
        foam.nanos.fs.File ffile = null;
        BlobService blobStore = (BlobService) x.get("blobStore");

        try {
          image = ImageIO.read(file);
          ByteArrayOutputStream baos = new ByteArrayOutputStream();
          ImageIO.write(image, "png", baos);
//          Blob blob = new javax.sql.rowset.serial.SerialBlob(baos.toByteArray());
          byte[] bytes = baos.toByteArray();
          InputStream is = new ByteArrayInputStream(bytes);
          foam.blob.Blob data = blobStore.put(new foam.blob.InputStreamBlob(is, bytes.length));
          ffile = new foam.nanos.fs.File.Builder(x)
            .setFilename("testimg")
            .setFilesize(bytes.length)
            .setData(data)
            .build();
        } catch ( IOException e ) {
          test(false, "fail");
        }
        return ffile;
      `
    }

  ]
})
