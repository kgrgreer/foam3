foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXCreateTradeRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to create trade on AFEX system when transaction is PENDING_PARENT_COMPLETED 
    and trade not yet created.`,

  javaImports: [
    'foam.blob.BlobService',
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.fs.File',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.InputStream',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.ConfirmationFileLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionLineItem',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAwareAgent() {
        @Override
        public void execute(X x) {

          Logger logger = (Logger) getX().get("logger");
          if ( ! (obj instanceof AFEXTransaction) ) {
            return;
          }
          
          AFEXTransaction transaction = (AFEXTransaction) obj.fclone();
          AFEXServiceProvider afexService = (AFEXServiceProvider) getX().get("afexServiceProvider");
          if ( transaction.getAfexTradeResponseNumber() == 0 ) {
            try {
              int result = afexService.createTrade(transaction);
              transaction.setAfexTradeResponseNumber(result);
              // update transaction
              ((DAO) getX().get("localTransactionDAO")).put_(getX(), transaction);

              if ( transaction.getAfexTradeResponseNumber() != 0 ) {
                try {
                  byte[] bytes = afexService.getConfirmationPDF(transaction);
                  InputStream inStream = new ByteArrayInputStream(bytes);
    
                  // Save the PDF on disk.
                  BlobService blobStore = (BlobService) x.get("blobStore");
                  foam.blob.Blob data = blobStore.put(new foam.blob.InputStreamBlob(inStream, bytes.length));
    
                  // Save the file in fileDAO.
                  DAO fileDAO = (DAO) x.get("fileDAO");
                  foam.nanos.fs.File thePDF = new foam.nanos.fs.File.Builder(x).setData(data)
                    .setOwner(transaction.findSourceAccount(x).getOwner()).setFilesize(bytes.length)
                    .setFilename("TransactionConfirmation_" + transaction.getId() + ".pdf").setMimeType("application/pdf").build();
    
                  File pdf = (File) fileDAO.inX(x).put(thePDF);
                  transaction.addLineItems(new TransactionLineItem[]{new ConfirmationFileLineItem.Builder(x).setGroup("fx").setFile(pdf).build()}, null);
                  ((DAO) x.get("transactionDAO")).inX(x).put(transaction.fclone());
                
                  // Append file to related invoice.
                  Transaction root = transaction.findRootTransaction(x, transaction);
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
                  String msg = "Error getting trade confirmation for AfexTransaction " + transaction.getId();
                  logger.error(msg, t);
                  Notification notification = new Notification.Builder(x)
                    .setTemplate("NOC")
                    .setBody(msg + " " + t.getMessage())
                    .build();
                    ((DAO) x.get("localNotificationDAO")).put(notification);
                }
              }

            } catch (Throwable t) {
              String msg = "Error getting trade confirmation for AfexTransaction " + transaction.getId();
              logger.error(msg, t);
              Notification notification = new Notification.Builder(x)
                .setTemplate("NOC")
                .setBody(msg + " " + t.getMessage())
                .build();
                ((DAO) x.get("localNotificationDAO")).put(notification);
            }
          }
        }

      }, "Rule to create trade on AFEX system when transaction is PENDING_PARENT_COMPLETED and trade not yet created.");
      `
    }
  ]

});
