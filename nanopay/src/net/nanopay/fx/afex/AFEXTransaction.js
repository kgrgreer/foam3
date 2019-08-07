/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Hold AFEX specific properties`,

  javaImports: [
    'com.itextpdf.html2pdf.HtmlConverter',
    'foam.blob.BlobService',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.fs.File',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.IOException',
    'java.io.InputStream',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.documents.AcceptanceDocument',
    'net.nanopay.documents.AcceptanceDocumentType',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Business',
    'net.nanopay.model.Currency',
    'net.nanopay.tx.ConfirmationFileLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionLineItem',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF'
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        if ( this.status == this.TransactionStatus.COMPLETED ) {
          return [
            'choose status',
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.PENDING ) {
          return [
            'choose status',
            ['COMPLETED', 'COMPLETED'],
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.SENT ) {
                  return [
                    'choose status',
                    ['COMPLETED', 'COMPLETED'],
                    ['DECLINED', 'DECLINED']
                  ];
                }
       return ['No status to choose'];
      }
    }
  ],

  methods: [ 
    {
      name: 'getTransactionConfirmation',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String',
      documentation: 'Generate a transaction confirmation HTML document for an AFEX transaction.',
      javaCode: `
      DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);
      DAO localAccountDAO = ((DAO) x.get("localAccountDAO")).inX(x);

      BankAccount sourceAccount = (BankAccount) localAccountDAO.find(getSourceAccount());
      BankAccount destinationAccount = (BankAccount) localAccountDAO.find(getDestinationAccount());
      User payee = (User) localUserDAO.find(destinationAccount.getOwner());
      User payer = (User) localUserDAO.find(sourceAccount.getOwner());
    
        Address payerAddress = payer.getBusinessAddress();
        String addressLine1 =
          (! SafetyUtil.isEmpty(payerAddress.getSuite()) ? payerAddress.getSuite() + "-" : "") +
          payerAddress.getStreetNumber() +
          " " +
          payerAddress.getStreetName();
        String addressLine2 =
          payerAddress.getCity() +
          ", " +
          payerAddress.findRegionId(x).getName() +
          ", " +
          payerAddress.findCountryId(x).getName();
    
        // Get the initiator, the person who created the invoice.
        DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
        Invoice invoice = (Invoice) invoiceDAO.find(getInvoiceId());
        long initiatorId = invoice.getCreatedBy();
        User initiator = (User) localUserDAO.find(initiatorId);
    
        // Get the releaser/approver, the person who created the transaction.
        User approver = (User) localUserDAO.find(getCreatedBy());
    
        // Get and format the destination currency amount.
        DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
        Currency destCurrency = (Currency) currencyDAO.find(getDestinationCurrency());
        String destAmountFormatted = destCurrency.format(getDestinationAmount());
    
        // Get and format the rate.
        String rate = String.format("%.12f", 1.0 / getFxRate());
    
        // Get and format the settlement amount.
        Currency srcCurrency = (Currency) currencyDAO.find(getSourceCurrency());
        String settlementAmount = srcCurrency.format(getAmount());
    
        // Get and format the fee.
        String fee = srcCurrency.format(getCost());
    
        // Get and format the total settlement.
        String totalSettlement = srcCurrency.format(getTotal());
    
        // Get the client ID.
        DAO afexBusinessDAO = ((DAO) x.get("afexBusinessDAO")).inX(x);
        AFEXBusiness afxBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, payer.getId()));
        String afexAccountNumber = afxBusiness.getAccountNumber();
    
        String invoiceCreated = String.format("%tD %tI:%tM %Tp %TZ", invoice.getCreated(), invoice.getCreated(), invoice.getCreated(), invoice.getCreated(), invoice.getCreated());
        String transactionCreated = String.format("%tD %tI:%tM %Tp %TZ", getCreated(), getCreated(), getCreated(), getCreated(), getCreated());
    
        // Add special disclosure.
        // We only show it if the payer's address is in one of the states that
        // requires a specific disclosure. If the payer is a business, this will be
        // the business address.
        AcceptanceDocument disclosure = null;
        DAO acceptanceDocumentDAO = ((DAO) x.get("acceptanceDocumentDAO")).inX(x);
        Address address = (payer instanceof Business)
          ? payer.getBusinessAddress()
          : payer.getAddress();
    
        if ( address != null ) {
          disclosure = (AcceptanceDocument) acceptanceDocumentDAO.find(
            AND(
              EQ(AcceptanceDocument.TRANSACTION_TYPE, getType()),
              EQ(AcceptanceDocument.DOCUMENT_TYPE, AcceptanceDocumentType.DISCLOSURE),
              EQ(AcceptanceDocument.COUNTRY, address.getCountryId()),
              EQ(AcceptanceDocument.STATE, address.getRegionId())
            )
          );
        }
        
        // TODO: replace AFX placeholders
        StringBuilder doc = new StringBuilder();
        doc.append("<html>");
        doc.append("<head>");
        doc.append("<meta charset=\\"utf-8\\">");
        doc.append("<title>Order Confirmation</title>");
        doc.append("<style>");
        doc.append("body {");
        doc.append("  width: 8.5in;");
        doc.append("  min-height: 11in;");
        doc.append("  font-family: sans-serif;");
        doc.append("  font-size: 12px;");
        doc.append("}");
        doc.append("img {");
        doc.append("  width: 250px");
        doc.append("}");
        doc.append("h1 {");
        doc.append("  text-align: center;");
        doc.append("}");
        doc.append("h2 {");
        doc.append("  text-decoration: underline;");
        doc.append("}");
        doc.append("footer {");
        doc.append("  position: fixed;");
        doc.append("  bottom: 0;");
        doc.append("}");
        doc.append("table {");
        doc.append("  border-collapse: collapse;");
        doc.append("  width: 100%;");
        doc.append("}");
        doc.append(".transaction td, .transaction th {");
        doc.append("  border: 1px solid #ddd;");
        doc.append("  padding: 3px;");
        doc.append("  vertical-align: top;");
        doc.append("}");
        doc.append(".transaction th {");
        doc.append("  background: #ddd;");
        doc.append("}");
        doc.append(".r-align {");
        doc.append("  text-align: right;");
        doc.append("}");
        doc.append("</style>");
        doc.append("</head>");
        doc.append("<body>");      
        doc.append(\"<h1>ORDER CONFIRMATION</h1>\");    
        doc.append(\"<table>\");      
        doc.append(\"  <tr>\");       
        doc.append(\"    <td><b>Client Account NUmber:</b></td>\");       
        doc.append(\"    <td>\").append(afexAccountNumber).append(\"</td>\");       
        doc.append(\"    <td><b>Transaction Number:</b></td>\");       
        doc.append(\"    <td>\").append(getReferenceNumber()).append(\"</td>\");      
        doc.append(\"  </tr>\");        
        doc.append(\"  <tr>\");      
        doc.append(\"    <td><b>Client Name:</b></td>\");
        doc.append(\"    <td>\").append(payer.label()).append(\"</td>\");       
        doc.append(\"    <td><b>Transaction Date:</b></td>\");       
        doc.append(\"    <td>\").append(transactionCreated).append(\"</td>\");        
        doc.append(\"  </tr>\");      
        doc.append(\"  <tr>\");        
        doc.append(\"    <td><b>Address:</b></td>\");       
        doc.append(\"    <td>\").append(addressLine1).append(\"<br>\").append(addressLine2).append(\"<br>\").append(payerAddress.getPostalCode()).append(\"</td>\");      
        doc.append(\"    <td></td>\");       
        doc.append(\"    <td></td>\");       
        doc.append(\"  </tr>\");       
        doc.append(\"  <tr>\");       
        doc.append(\"    <td><b>Tel:</b></td>\");       
        doc.append(\"    <td>\").append(payer.getBusinessPhone().getNumber()).append(\"</td>\");       
        doc.append(\"    <td><b>Deal Type:</b></td>\");        
        doc.append(\"    <td>Spot</td>\");     
        doc.append(\"  </tr>\");        
        doc.append(\"  <tr>\");       
        doc.append(\"    <td><b>Fax:</b></td>\");        
        doc.append(\"    <td></td>\"); // This can be left blank.       
        doc.append(\"    <td><b>Dealer:</b></td>\");      
        doc.append(\"    <td>AFEX</td>\");      
        doc.append(\"  </tr>\");       
        doc.append(\"  <tr>\");      
        doc.append(\"    <td></td>\");        
        doc.append(\"    <td></td>\");       
        doc.append(\"    <td><b>Phone:</b></td>\");       
        doc.append(\"  </tr>\");        
        doc.append(\"  <tr>\");       
        doc.append(\"    <td></td>\");       
        doc.append(\"    <td></td>\");        
        doc.append(\"    <td><b>Email:</b></td>\");       
        doc.append(\"    <td>fxdesk@afex.com</td>\");       
        doc.append(\"  </tr>\");      
        doc.append(\"  <tr>\");       
        doc.append(\"    <td><b>Initiated By:</b></td>\");        
        doc.append(\"    <td>\").append(initiator.label()).append(\" [\").append(invoiceCreated).append(\"]\").append(\"</td>\");        
        doc.append(\"    <td></td>\");      
        doc.append(\"    <td></td>\");        
        doc.append(\"  </tr>\");        
        doc.append(\"  <tr>\");      
        doc.append(\"    <td><b>Approved By:</b></td>\");        
        doc.append(\"    <td>\").append(approver.label()).append(\" [\").append(transactionCreated).append(\"]\").append(\"</td>\");       
        doc.append(\"    <td></td>\");      
        doc.append(\"    <td></td>\");      
        doc.append(\"  </tr>\");        
        doc.append(\"  <tr>\");       
        doc.append(\"    <td><b>Released By:</b></td>\");       
        doc.append(\"    <td>\").append(approver.label()).append(\" [\").append(transactionCreated).append(\"]\").append(\"</td>\");       
        doc.append(\"    <td></td>\");      
        doc.append(\"    <td></td>\");      
        doc.append(\"  </tr>\");       
        doc.append(\"</table>\");      
        doc.append(\"<h2>Transaction Summary</h2>\");      
        doc.append(\"<table class=\\\"transaction\\\">\");        
        doc.append(\"  <tr>\");       
        doc.append(\"    <th>Item</th>\");       
        doc.append(\"    <th>Payee Name</th>\");       
        doc.append(\"    <th>Method</th>\");        
        doc.append(\"    <th>Cur.</th>\");       
        doc.append(\"    <th>Amount</th>\");        
        doc.append(\"    <th>Rate</th>\");       
        doc.append(\"    <th>Settlement Amount</th>\");        
        doc.append(\"    <th>Fee</th>\");     
        doc.append(\"    <th>Total Settlement</th>\");      
        doc.append(\"  </tr>\");       
        doc.append(\"  <tr>\");       
        doc.append(\"    <td>1</td>\");       
        doc.append(\"    <td>\").append(payee.label()).append(\"</td>\");      
        doc.append(\"    <td>EFT/ACH</td>\");       
        doc.append(\"    <td>\").append(getDestinationCurrency()).append(\"</td>\");       
        doc.append(\"    <td class=\\\"r-align\\\">\").append(destAmountFormatted).append(\"</td>\");       
        doc.append(\"    <td class=\\\"r-align\\\">\").append(rate).append(\"</td>\");       
        doc.append(\"    <td class=\\\"r-align\\\">\").append(settlementAmount).append(\"</td>\");      
        doc.append(\"    <td class=\\\"r-align\\\">\").append(fee).append(\"</td>\");        
        doc.append(\"    <td class=\\\"r-align\\\">\").append(totalSettlement).append(\"</td>\");       
        doc.append(\"  </tr>\");       
        doc.append(\"  <tr>\");       
        doc.append(\"    <td></td>\");      
        doc.append(\"    <td></td>\");       
        doc.append(\"    <td></td>\");       
        doc.append(\"    <td></td>\");        
        doc.append(\"    <td></td>\");        
        doc.append(\"    <td class=\\\"r-align\\\"><b>Total (\").append(getSourceCurrency()).append(\"):</b></td>\");       
        doc.append(\"    <td class=\\\"r-align\\\"><b>\").append(settlementAmount).append(\"</b></td>\");      
        doc.append(\"    <td class=\\\"r-align\\\"><b>\").append(fee).append(\"</b></td>\");      
        doc.append(\"    <td class=\\\"r-align\\\"><b>\").append(totalSettlement).append(\"</b></td>\");       
        doc.append(\"  </tr>\");      
        doc.append(\"</table>\");  

        if ( disclosure != null ) {          
          doc.append(disclosure.getBody());
        }

        doc.append(\"<footer>\");       
        doc.append(\"</footer>\");       
        doc.append(\"</body>\");      
        doc.append(\"</html>\");
    
        return doc.toString();
      
      `
    },
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      super.limitedCopyFrom(other);
      setLineItems(other.getLineItems());
      `
    },
    {
      name: 'executeAfterPut',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      super.executeAfterPut(x, oldTxn);
      if ( oldTxn == null ) {
        // Generate the HTML.
        String html = getTransactionConfirmation(x);
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
          BlobService blobStore = (BlobService) x.get("blobStore");
          foam.blob.Blob data = blobStore.put(new foam.blob.InputStreamBlob(inStream, size));
    
          // Save the file in fileDAO.
          DAO fileDAO = (DAO) x.get("fileDAO");
          foam.nanos.fs.File thePDF = new foam.nanos.fs.File.Builder(x).setData(data)
              .setOwner(findSourceAccount(x).getOwner()).setFilesize(size)
              .setFilename("TransactionConfirmation_" + getId() + ".pdf").setMimeType("application/pdf").build();
        
          File pdf = (File) fileDAO.inX(x).put(thePDF);
          addLineItems(new TransactionLineItem[] {new ConfirmationFileLineItem.Builder(x).setGroup("fx").setFile(pdf).build()}, null);
          ((DAO) x.get("transactionDAO")).inX(x).put(this.fclone());
        }
      } 
      `
    }
  ],
});
