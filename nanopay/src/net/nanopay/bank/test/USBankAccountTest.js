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
  package: 'net.nanopay.bank.test',
  name: 'USBankAccountTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.blob.BlobService',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.test.Test',
    'foam.test.TestUtils',
    'javax.imageio.ImageIO',
    'java.io.*',
    'java.util.List',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.model.Branch',
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

        test(update_USBankAccount_Test(x), "USBankAccount can be updated");

        localAccountDAO.remove(bankAccount);
      `
    },
    {
      name: 'update_USBankAccount_Test',
      type: 'boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        try{
          Branch branch;
          DAO accountDAO = (DAO) x.get("localAccountDAO");
          List usAccounts = ((ArraySink) accountDAO
            .where(
              foam.mlang.MLang.AND(
                foam.mlang.MLang.EQ(net.nanopay.bank.USBankAccount.COUNTRY, "US"),
                foam.mlang.MLang.NEQ(USBankAccount.VOID_CHECK_IMAGE, null)
              )
            )
            .select(new ArraySink()))
            .getArray();
          BankAccount usAccount = (BankAccount) usAccounts.get(0);
          BankAccount newaccount = (BankAccount) ((BankAccount) usAccount).fclone();
          accountDAO.put(newaccount);
          return true;
        } catch ( Exception e ) {
          return false;
        }
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
        java.io.File file = new java.io.File("favicon/ablii.png");
        java.awt.image.BufferedImage image = null;
        foam.nanos.fs.File ffile = null;
        BlobService blobStore = (BlobService) x.get("blobStore");

        try {
          image = ImageIO.read(file);
          ByteArrayOutputStream baos = new ByteArrayOutputStream();
          ImageIO.write(image, "png", baos);
          byte[] bytes = baos.toByteArray();
          InputStream is = new ByteArrayInputStream(bytes);
          foam.blob.Blob data = new foam.blob.InputStreamBlob(is, bytes.length);
          ffile = new foam.nanos.fs.File.Builder(x)
            .setFilename("testimg")
            .setFilesize(bytes.length)
            .setData(data)
            .setMimeType("image/png")
            .build();
          ((foam.dao.DAO) x.get("fileDAO")).put(ffile);
        } catch ( java.io.IOException | foam.core.FOAMException e ) {
          test(false, "Can't create Image blob");
        }
        return ffile;
      `
    }

  ]
})
