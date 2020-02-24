foam.CLASS({
    package: 'net.nanopay.fx.afex',
    name: 'AFEXCreateTradeRequestPDFRule',

    documentation: 'Create AFEX trade request pdf.',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.blob.BlobService',
      'foam.dao.DAO',
      'foam.nanos.fs.File',
      'foam.nanos.logger.Logger',
      'java.io.ByteArrayInputStream',
      'java.io.InputStream',
      'net.nanopay.invoice.model.Invoice',
      'net.nanopay.fx.afex.AFEXServiceProvider',
      'net.nanopay.tx.ConfirmationFileLineItem',
      'net.nanopay.tx.model.Transaction',
      'net.nanopay.fx.afex.AFEXTransaction',
      'net.nanopay.tx.TransactionLineItem',
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            AFEXTransaction oldTxn = (AFEXTransaction) oldObj;
            AFEXTransaction txn    = (AFEXTransaction) obj;
            if ( oldTxn == null ) {
              AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
              byte[] bytes = afexServiceProvider.getConfirmationPDF(txn);
              if ( bytes != null ) {
                try {
                  InputStream inStream = new ByteArrayInputStream(bytes);

                  // Save the PDF on disk.
                  BlobService blobStore = (BlobService) x.get("blobStore");
                  foam.blob.Blob data = blobStore.put(new foam.blob.InputStreamBlob(inStream, bytes.length));

                  // Save the file in fileDAO.
                  DAO fileDAO = (DAO) x.get("fileDAO");
                  foam.nanos.fs.File thePDF = new foam.nanos.fs.File.Builder(x).setData(data)
                    .setOwner(txn.findSourceAccount(x).getOwner()).setFilesize(bytes.length)
                    .setFilename("TransactionConfirmation_" + txn.getId() + ".pdf").setMimeType("application/pdf").build();

                  File pdf = (File) fileDAO.inX(x).put(thePDF);
                  txn.addLineItems(new TransactionLineItem[]{new ConfirmationFileLineItem.Builder(x).setGroup("fx").setFile(pdf).build()}, null);
                  ((DAO) x.get("transactionDAO")).inX(x).put(txn.fclone());

                  // Append file to related invoice.
                  Transaction root = txn.findRootTransaction(x, txn);
                  if ( root.getInvoiceId() != 0 ) {
                    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
                    Invoice invoice = (Invoice) invoiceDAO.find(root.getInvoiceId());

                    if ( invoice == null ) {
                      throw new RuntimeException("Couldn't fetch invoice associated to AFEX transaction");
                    }

                    File[] files = invoice.getInvoiceFile();
                    File[] fileArray = new File[files.length + 1];
                    System.arraycopy(files, 0, fileArray, 0, files.length);
                    fileArray[files.length] = pdf;
                    invoice.setInvoiceFile(fileArray);
                    invoiceDAO.put(invoice);
                  }
                } catch (Throwable t) {
                  ((Logger) x.get("logger")).error("Error creating AFEX trade request pdf", t);
                }
              }
            }
          }
        }, "Create AFEX Trade Request PDF");
        `
      }
    ]
  });
