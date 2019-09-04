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
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.io.*',
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
    'net.nanopay.model.Currency',
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
        var url = window.location.origin + "/service/settlementReports?userId=" + this.id + "&startDate="+sDate+"&endDate="+dDate;
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
      name: 'checkAndSetCalendarFields',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'start',
          type: 'String'
        },
        {
          name: 'end',
          type: 'String'
        }
      ],
      javaCode: `
        try {
          setStartDate(new Date(start));
          setEndDate(new Date(end));

          setDated(true);
        } catch (Exception e ) { 
          // Integer.parseInt throws java.lang.NumberFormatException
          Logger logger = (Logger) x.get("logger");
          logger.warning("Error generating settlementReport - passed in date filter error: ", e); 
          setDated(false);
        }
      `
    },
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
        DAO    userDAO           = (DAO) x.get("localUserDAO");
        DAO    agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");
        Logger logger            = (Logger) x.get("logger");
    
        // Id check:
        HttpServletRequest req   = x.get(HttpServletRequest.class);
        long id = Integer.parseInt(req.getParameter("userId"));
        if ( id <= 0 ) {
          logger.warning("Error generating settlementReport - business/user Id invalid.");
          return;
        }

        // Confirm Calendar search fields
        checkAndSetCalendarFields(x, req.getParameter("startDate"), req.getParameter("endDate"));

        // User check:
        User business = findUser(x,id);
        if ( business == null ) {
          logger.warning("Error generating settlementReport - user.id:" + id + " does not exist.");
          return;
        }

        // Gather data that will be displayed in the SettlementReport.pdf
        filterInvoiceDAO(x, business);

        try {
          // create a temporary folder to save files before zipping
          FileUtils.forceMkdir(new File("/tmp/SettlementReport/"));
    
          File settlementReport = collectInvoiceDataAndWriteToData(x, business);
    
          if ( settlementReport == null ){
            logger.warning("Error generating settlementReport - File null.");
            return;
          }
    
          downloadZipFile(x, (Business)business, settlementReport);
    
          // delete the temporary folder.
          FileUtils.deleteDirectory(new File("/tmp/SettlementReport/"));

        } catch (IOException e) {
          logger.error("Error generating settlementReport: ", e);
        } catch (Throwable t) {
          logger.error("Error generating settlementReport: ", t);
          throw new RuntimeException(t);
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
      name: 'findUser',
      javaType: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'long'
        }
      ],
      javaCode:
      `
        DAO  userDAO = (DAO) x.get("userDAO");
        User user = (User) userDAO.find(id);
    
        if ( ! (user instanceof Business) ) {
          DAO  agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
          UserUserJunction userUserJunction = (UserUserJunction) agentJunctionDAO
            .find(EQ(UserUserJunction.SOURCE_ID, user.getId()));

          return userUserJunction.findTargetId(x);
        }

        return user;
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
        }
      ],
      javaCode:
      `
        Logger logger = (Logger) x.get("logger");
        StringBuilder title = sb.get();

        if ( getDated() ) {
          try {
            title.append("Settlement report for ")
              .append(getStartDate())
              .append(" to ")
              .append(getEndDate())
              .append("\\n for Business ID: ")
              .append(user.getId())
              .append("\\n\\n");
          } catch (Exception e) {
            logger.warning("Error generating settlementReport - Error in title", e);
            return null;
          }
        } else {
          title.append("Settlement report\\n for Business ID: ").append(user.getId()).append("\\n\\n");
        }
    
        String path = "/tmp/SettlementReport/[" + user.getOrganization() + "]SettlementReport.pdf";
    
        try {
          Document document = new Document();
          PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
          document.open();

          document.add(new Paragraph(title.toString()));
    
          List list = createListForInvoices(x, user.getOrganization());
    
          document.add(list);
          document.add(Chunk.NEWLINE);
          
          document.close();
          writer.close();
    
          return new File(path);
        } catch (Exception e) {
          logger.error("Error generating settlementReport - writing to document.", e);
        }
        return null; 
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
          createdBy_String  = tempUser == null ? "n/a" : tempUser.label();
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
            exRate            = summaryTransaction.getFxRate() != 1 ? "1 CAD = " + decimalFormat.format((1/summaryTransaction.getFxRate())) + " " + summaryTransaction.getSourceCurrency() : null;
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
      javaCode:
      `
        HttpServletResponse response = x.get(HttpServletResponse.class);
    
        response.setContentType("multipart/form-data");
    
        String businessName = business.getBusinessName();
        String downloadName = "[" + businessName + "]SettlementReport.zip";
    
        response.setHeader("Content-Disposition", "attachment;fileName=\\"" + downloadName + "\\"");
    
        DataOutputStream os = null;
        ZipOutputStream zipos = null;
        try {
          zipos = new ZipOutputStream(new BufferedOutputStream(response.getOutputStream()));
          zipos.setMethod(ZipOutputStream.DEFLATED);
    
          zipos.putNextEntry(new ZipEntry(file.getName()));
          os = new DataOutputStream(zipos);
          InputStream is = new FileInputStream(file);
          byte[] b = new byte[100];
          int length;
          while((length = is.read(b))!= -1){
            os.write(b, 0, length);
          }
          is.close();
          zipos.closeEntry();
          os.flush();
          
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error(e);
        } finally {
          IOUtils.closeQuietly(os);
          IOUtils.closeQuietly(zipos);
        }
      `
    }
  ]
});
