foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionConfirmationFileGenerator',

  javaImports: [
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

    'net.nanopay.tx.model.Transaction',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF'
  ],

  documentation: 'Generate a transaction confirmation PDF for a transaction',

  methods: [
    {
      documentation: `Generate a transaction confirmation PDF for a transaction`,
      name: 'generateTransactionConfirmationPDF',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'foam.nanos.fs.File',
      javaCode: `
      // Generate the HTML.
      String doc = txn.getTransactionConfirmation(x);
  
      if ( ! SafetyUtil.isEmpty(doc) ) {
        // Use the library to generate a PDF from the HTML.
        ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        try {
          HtmlConverter.convertToPdf(doc, outStream);
        } catch (IOException e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("Error converting to PDF.");
          throw new RuntimeException(e);
        }
        int size = outStream.size();
        InputStream inStream = new ByteArrayInputStream(outStream.toByteArray());
  
        // Save the PDF on disk.
        BlobService blobStore = (BlobService) x.get("blobStore");
        foam.blob.Blob data = blobStore.put(new foam.blob.InputStreamBlob(inStream, size));
  
        // Save the file in fileDAO.
        DAO fileDAO = (DAO) x.get("fileDAO");
        foam.nanos.fs.File thePDF = new foam.nanos.fs.File.Builder(x).setData(data)
            .setOwner(txn.findSourceAccount(x).getOwner()).setFilesize(size)
            .setFilename("TransactionConfirmation_" + txn.getId() + ".pdf").setMimeType("application/pdf").build();
        return (File) fileDAO.inX(x).put(thePDF);
      }
  
      return null;
      `
    },
  ]
});
