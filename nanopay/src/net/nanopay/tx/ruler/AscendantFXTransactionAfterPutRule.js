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
    package: 'net.nanopay.tx.ruler',
    name: 'AscendantFXTransactionAfterPutRule',

    documentation: 'Ascendant FX transaction after put rule.',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.core.ContextAgent',
      'com.itextpdf.html2pdf.HtmlConverter',
      'foam.blob.BlobService',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.fs.File',
      'foam.nanos.logger.Logger',
      'foam.util.SafetyUtil',
      'java.io.ByteArrayInputStream',
      'java.io.ByteArrayOutputStream',
      'java.io.IOException',
      'java.io.InputStream',
      'net.nanopay.fx.ascendantfx.AscendantFXTransaction',
      'net.nanopay.invoice.model.Invoice',
      'net.nanopay.tx.ConfirmationFileLineItem',
      'net.nanopay.tx.TransactionLineItem',
      'net.nanopay.tx.model.Transaction'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            AscendantFXTransaction oldTxn = (AscendantFXTransaction) oldObj;
            AscendantFXTransaction txn    = (AscendantFXTransaction) obj;
            if ( oldTxn == null ) {
              // Generate the HTML.
              String html = txn.getTransactionConfirmation(x);
              if ( ! SafetyUtil.isEmpty(html) ) {
                // Use the library to generate a PDF from the HTML.
                ByteArrayOutputStream outStream = new ByteArrayOutputStream();
                try {
                  HtmlConverter.convertToPdf(html, outStream);
                } catch (IOException e) {
                  Logger logger = (Logger) x.get("logger");
                  logger.error("Error converting to PDF.");
                  throw new RuntimeException(e);
                }
                int size = outStream.size();
                InputStream inStream = new ByteArrayInputStream(outStream.toByteArray());

                // Save the PDF on disk.
                // BlobService blobStore = (BlobService) x.get("blobStore");
                // foam.blob.Blob data = blobStore.put(new foam.blob.InputStreamBlob(inStream, size));
                foam.blob.Blob data = new foam.blob.InputStreamBlob(inStream, size);

                // Save the file in fileDAO.
                DAO fileDAO = (DAO) x.get("fileDAO");
                foam.nanos.fs.File thePDF = new foam.nanos.fs.File.Builder(x)
                    .setData(data)
                    .setOwner(txn.findSourceAccount(x).getOwner())
                    .setFilesize(size)
                    .setFilename("TransactionConfirmation_" + txn.getId() + ".pdf")
                    .setMimeType("application/pdf")
                    .build();

                File pdf = (File) fileDAO.inX(x).put(thePDF);
                txn.addLineItems( new TransactionLineItem[] {new ConfirmationFileLineItem.Builder(x).setGroup("fx").setFile(pdf).build()} );
                ((DAO) x.get("transactionDAO")).inX(x).put(txn.fclone());

                // Append file to related invoice.
                try {
                  Transaction root = txn.findRootTransaction(x, txn);
                  if ( root.getInvoiceId() != 0 ) {
                    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
                  Invoice invoice = (Invoice) invoiceDAO.find(root.getInvoiceId());

                    if ( invoice == null ) {
                      throw new RuntimeException("Couldn't fetch invoice associated to AFX transaction");
                    }

                    File[] files = invoice.getInvoiceFile();
                    File[] fileArray = new File[files.length + 1];
                    System.arraycopy(files, 0, fileArray, 0, files.length);
                    fileArray[files.length] = pdf;
                    invoice.setInvoiceFile(fileArray);
                    invoiceDAO.put(invoice);
                  }
                } catch (Exception e) {
                ((Logger) x.get("logger")).error("Error appending PDF to AscendantFXTransaction invoice", e);
                }
              }
            }
          }
        }, "Ascendant FX Transaction After Put Logic");
        `
      }
    ]
  });
