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
  package: 'net.nanopay.invoice',
  name: 'InvoiceFilteredSettlementReport',

  extends: 'foam.blob.ProxyBlobService',

  implements: [
    'foam.nanos.http.WebAgent'
  ],

  javaImports: [
    'com.itextpdf.text.*',
    'com.itextpdf.text.pdf.PdfWriter',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.auth.Subject',
    'foam.nanos.http.HttpParameters',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.io.*',
    'java.nio.file.Files',
    'java.nio.file.Path',
    'java.text.DecimalFormat',
    'java.text.SimpleDateFormat',
    'java.util.Date',
    'java.util.zip.ZipEntry',
    'java.util.zip.ZipOutputStream',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Business',
    'net.nanopay.tx.model.Transaction',
    'foam.core.Currency',
    'org.apache.commons.io.FileUtils',
    'org.apache.commons.io.IOUtils',
    'static foam.mlang.MLang.*',
  ],

  documentation: `
    This class is for a service, to generate a settlement report(pdf) based on a search field for dates.
      Example of Client Side Code to get this service call:
        // Let us assume that we want to search for invoices with a field 3 days before and 3 days after a specified invoice
        var inv = await this.invoiceDAO.find(1);
        var sDate = inv.paymentDate.getTime() - (1000*60*60*24*3);
        var dDate = inv.paymentDate.getTime() + (1000*60*60*24*3);
        console.log('sDate = '+sDate+ ' eDate = ' + dDate);
        var url = window.location.origin + "/service/settlementReports?startDate="+sDate+"&endDate="+dDate;
        window.location.assign(url);
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO'
    },
    {
      class: 'Date',
      name: 'endDate'
    },
    {
      class: 'Date',
      name: 'startDate'
    },
    {
      class: 'Boolean',
      name: 'dated'
    }

  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
            `
            protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
            @Override
            protected StringBuilder initialValue() {
              return new StringBuilder();
            }

            @Override
            public StringBuilder get() {
              StringBuilder b = super.get();
              b.setLength(0);
              return b;
            }
          };`
        );
      }
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode:
      `
        HttpParameters p        = x.get(HttpParameters.class);
        DAO    userDAO           = (DAO) x.get("localUserDAO");
        DAO    agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");
        Logger logger            = (Logger) x.get("logger");
        Subject subject          = (Subject) x.get("subject");
        User business            = subject.getUser();

        String errorMessage = null; 
        int errorStatus = 0;
        try {
          // Confirm Calendar search fields
          setStartDate(new Date(String.valueOf(p.get("startDate"))));
          setEndDate(new Date(String.valueOf(p.get("endDate"))));
          setDated(true);

          // Gather data that will be displayed in the SettlementReport.pdf
          filterInvoiceDAO(x, business);

          // create a temporary folder to save files before zipping
          Path path = Files.createTempDirectory("/tmp");

          File settlementReport = collectInvoiceDataAndWriteToData(x, business, path);

          downloadZipFile(x, (Business)business, settlementReport);
        } catch (NumberFormatException | NullPointerException e) {
          logger.warning(this.getClass().getSimpleName(), "Invalid Date Range", e);
          errorMessage = "Invalid Date Range";
          errorStatus = 400;
        } catch (IOException e) {
          logger.error(this.getClass().getSimpleName(), e);
          errorMessage = "IOException";
          errorStatus = 500;
        } catch (DocumentException e) {
          logger.error(this.getClass().getSimpleName(), e);
          errorMessage = e.getMessage();
          errorStatus = 500;
        }
        if ( errorMessage != null ) {
          HttpServletResponse resp = x.get(HttpServletResponse.class);
          try {
            resp.sendError(errorStatus, "Failed to create Settlement Report: "+errorMessage);
          } catch (IOException e) {
            logger.error(this.getClass().getSimpleName(), "Error returning error", e);
          }
        }
      `
    },
    {
      name: 'filterInvoiceDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'User'
        }
      ],
      javaCode:
      `
        DAO  invoiceDAO = (DAO) x.get("invoiceDAO");
        if ( getDated() ) {
          setFilteredDAO(invoiceDAO.where(
            AND(
              NEQ(Invoice.PAYMENT_DATE, null),
              GTE(Invoice.PAYMENT_DATE, getStartDate()),
              LTE(Invoice.PAYMENT_DATE, getEndDate()),
              OR(
                EQ(Invoice.PAYER_ID, user.getId()),
                EQ(Invoice.PAYEE_ID, user.getId()),
                EQ(Invoice.CREATED_BY, user.getId())
              )
            )
          ).orderBy(new foam.mlang.order.Desc(Invoice.PAYMENT_DATE)));

        } else {
          setFilteredDAO(invoiceDAO.where(
            AND(
              NEQ(Invoice.PAYMENT_DATE, null),
              OR(
                EQ(Invoice.PAYER_ID, user.getId()),
                EQ(Invoice.PAYEE_ID, user.getId()),
                EQ(Invoice.CREATED_BY, user.getId())
              )
            )
          ).orderBy(new foam.mlang.order.Desc(Invoice.PAYMENT_DATE)));
        }
      `
    },
    {
      name: 'collectInvoiceDataAndWriteToData',
      javaType: 'java.io.File',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'path',
          type: 'java.nio.file.Path'
        }
      ],
      javaThrows: ['FileNotFoundException', 'DocumentException'],
      javaCode:
      `
        StringBuilder title = sb.get();

        if ( getDated() ) {
          title.append("Settlement report for ")
            .append(getStartDate())
            .append(" to ")
            .append(getEndDate())
            .append("\\n for Business ID: ")
            .append(user.getId())
            .append("\\n\\n");
        } else {
          title.append("Settlement report\\n for Business ID: ").append(user.getId()).append("\\n\\n");
        }

        String pdf = path.toString()+File.pathSeparator+"[" + user.getOrganization() + "]SettlementReport.pdf";

        Document document = new Document();
        PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(pdf));
        document.open();
        document.add(new Paragraph(title.toString()));

        List list = createListForInvoices(x, user.getOrganization()); 
        document.add(list);
        document.add(Chunk.NEWLINE);
        document.close();
        writer.close();

        return new File(pdf);
      `
    },
    {
      name: 'createListForInvoices',
      javaType: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'businessName',
          type: 'String'
        }
      ],
      javaCode:
      `
        SimpleDateFormat df     = new SimpleDateFormat("yyyy/dd/MM, HH:mm:ss");
        User tempUser           = null;
        String title            = null;
        java.util.List<Invoice> invoiceArray_ = ((ArraySink)
          getFilteredDAO().select(new ArraySink())).getArray();
        List list = new List(List.UNORDERED);

        String transDate = "";
        String createdBy_String = "";
        String businessNamePayer = "";
        String businessNamePayee = "";
        String srcCurrency = "";
        String dstCurrency = "";
        String exRate = "";
        String invoiceStatus = "";
        String transactionID = "";
        String invoicePurchaseOrder = "";
        String invoiceID = "";
        String invoiceAmount = "";

        for (Invoice invoice : invoiceArray_ ) {
          // Format Information variables for each Invoice
          transDate         = df.format(invoice.getPaymentDate());
          tempUser          = invoice.findCreatedBy(x);
          createdBy_String  = tempUser == null ? "n/a" : tempUser.toSummary();
          tempUser          = invoice.findPayerId(x);
          businessNamePayer = tempUser == null ? "n/a" : tempUser.getOrganization();
          tempUser          = invoice.findPayeeId(x);
          businessNamePayee = tempUser == null ? "n/a" : tempUser.getOrganization();
          srcCurrency       = invoice.getSourceCurrency();
          dstCurrency       = invoice.getDestinationCurrency();
          invoiceStatus          = invoice.getStatus().getLabel();
          transactionID          = invoice.getReferenceId();
          invoicePurchaseOrder   = SafetyUtil.isEmpty(invoice.getPurchaseOrder())
            ? "n/a" : invoice.getPurchaseOrder();
          invoiceID              = Long.toString(invoice.getId());

          DAO transactionDAO = (DAO) x.get("localTransactionDAO");
          Transaction txn = (Transaction) transactionDAO.find(invoice.getPaymentId());
          if ( txn != null && txn instanceof FXSummaryTransaction ) {
            DecimalFormat decimalFormat = new DecimalFormat("#.####");
            FXSummaryTransaction summaryTransaction = (FXSummaryTransaction) txn;
            exRate            = summaryTransaction.getFxRate() != 1 ? "1 " + summaryTransaction.getDestinationCurrency() + " = " + decimalFormat.format((1/summaryTransaction.getFxRate())) + " " + summaryTransaction.getSourceCurrency() : null;
          } else {
            exRate            = invoice.getExchangeRate() != 1 ? Long.toString(invoice.getExchangeRate()) : null;
          }

          DAO currencyDAO = (DAO) x.get("currencyDAO");
          Currency currency = (Currency) currencyDAO.find(dstCurrency);
          invoiceAmount = currency.format(invoice.getAmount()) + " " + dstCurrency;

          // Put all variables with text for each line, for write to doc.pdf(settlementReport) 
          list.add(new ListItem("Invoice ID: " + invoiceID ));
          list.add(new ListItem("PO: " + invoicePurchaseOrder));
          list.add(new ListItem("\tTransaction Date: " + transDate));
          list.add(new ListItem("\tInvoice was established by: " + createdBy_String));
          list.add(new ListItem("\tPayer: " + businessNamePayer));
          list.add(new ListItem("\tPayee: " + businessNamePayee));
          list.add(new ListItem("\tSource Account Currency Type: " + srcCurrency));
          list.add(new ListItem("\tDestination Account Currency Type: " + dstCurrency));
          if ( exRate != null && exRate.length() != 0 ) {
            list.add(new ListItem("\tExchange Rate: " + exRate));
          }
          list.add(new ListItem("\tStatus of Payment: " + invoiceStatus));
          list.add(new ListItem("\tTransaction ID: " + transactionID));
          list.add(new ListItem("\tInvoice Amount: " + invoiceAmount + "\\n\\n"));
        }
        return list;
      `
    },
    {
      name: 'downloadZipFile',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'business',
          type: 'net.nanopay.model.Business'
        },
        {
          name: 'file',
          type: 'File'
        }
      ],
      javaThrows: ['IOException'],
      javaCode:
      `
        HttpServletResponse response = x.get(HttpServletResponse.class);
    
        response.setContentType("multipart/form-data");
    
        String businessName = business.getBusinessName();
        String downloadName = "[" + businessName + "]SettlementReport.zip";
    
        response.setHeader("Content-Disposition", "attachment;fileName=\\"" + downloadName + "\\"");
    
        DataOutputStream os = null;
        ZipOutputStream zipos = null;
        InputStream is = null;
        try {
          zipos = new ZipOutputStream(new BufferedOutputStream(response.getOutputStream()));
          zipos.setMethod(ZipOutputStream.DEFLATED);
          zipos.putNextEntry(new ZipEntry(file.getName()));
          os = new DataOutputStream(zipos);
          is = new FileInputStream(file);
          byte[] b = new byte[100];
          int length;
          while((length = is.read(b))!= -1){
            os.write(b, 0, length);
          }
          is.close();
          zipos.closeEntry();
          os.flush();
        } finally {
          IOUtils.closeQuietly(is);
          IOUtils.closeQuietly(os);
          IOUtils.closeQuietly(zipos);
        }
      `
    }
  ]
});
