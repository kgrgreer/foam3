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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXGetPDFRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to get AFEX confirmation PDF.`,

  javaImports: [
    'foam.blob.BlobService',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.fs.File',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.InputStream',
    'java.util.List',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.ConfirmationFileLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionLineItem'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {

          DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
          Invoice invoice = (Invoice) obj.fclone();
          Logger logger = (Logger) x.get("logger");
          DAO transactionDAO = ((DAO) x.get("localTransactionDAO")).inX(x);

          Transaction txn = (Transaction) transactionDAO.find(invoice.getPaymentId());

          if ( ! (txn instanceof FXSummaryTransaction) ) {
            return;
          }
                   
          while ( ! (txn.getClassInfo() == AFEXTransaction.getOwnClassInfo()) ) {
            ArraySink sink = new ArraySink();
            (txn.getChildren(x)).select(sink);
            List list = sink.getArray();
            txn = (Transaction) list.get(0);
          }

          if ( txn == null || ! (txn.getClassInfo() == AFEXTransaction.getOwnClassInfo()) ) {
            return;
          }

          AFEXTransaction transaction = (AFEXTransaction) txn;

          if ( transaction.getAfexTradeResponseNumber() == 0 || transaction.getStatus() != TransactionStatus.PENDING_PARENT_COMPLETED ) {
            return;
          }
          
          AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("afexServiceProvider");

          if ( transaction.getAfexTradeResponseNumber() != 0 ) {
            try {
              byte[] bytes = afexService.getConfirmationPDF(transaction);
              InputStream inStream = new ByteArrayInputStream(bytes);
              foam.blob.Blob data = new foam.blob.InputStreamBlob(inStream, bytes.length);
              // Save the file in fileDAO.
              DAO fileDAO = (DAO) x.get("fileDAO");
              foam.nanos.fs.File thePDF = new foam.nanos.fs.File.Builder(x)
                .setData(data)
                .setOwner(transaction.findSourceAccount(x)
                .getOwner())
                .setFilesize(bytes.length)
                .setFilename("AFEXTradeConfirmation.pdf")
                .setMimeType("application/pdf")
                .build();

              File pdf = (File) fileDAO.inX(x).put(thePDF);
              transaction.addLineItems( new TransactionLineItem[]{new ConfirmationFileLineItem.Builder(x).setGroup("fx").setFile(pdf).build()} );
              transaction = (AFEXTransaction) transactionDAO.put(transaction);
            
              // Append file to related invoice.
              File[] files = invoice.getInvoiceFile();
              File[] fileArray = new File[files.length + 1];
              System.arraycopy(files, 0, fileArray, 0, files.length);
              fileArray[files.length] = pdf;
              invoice.setInvoiceFile(fileArray);
              invoiceDAO.put(invoice);
            } catch (Throwable t) {
              String msg = "Error getting trade confirmation for AfexTransaction " + transaction.getId();
              logger.error(msg, t);
              ((DAO) x.get("alarmDAO")).put(new foam.nanos.alarming.Alarm.Builder(x)
                .setName("AFEX Trade Confirmation")
                .setReason(foam.nanos.alarming.AlarmReason.TIMEOUT)
                .setSeverity(foam.log.LogLevel.ERROR)
                .setNote(msg)
                .build());
              Notification notification = new Notification.Builder(x)
                .setTemplate("NOC")
                .setBody(msg + " " + t.getMessage())
                .build();
                ((DAO) x.get("localNotificationDAO")).put(notification);
            }
          }
        }

      }, "Rule to get AFEX confirmation PDF.");
      `
    }
  ]

});
