foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'InvoiceFilteredSettlementReport',

  documentation: '',

  extends: [
    'foam.blob.ProxyBlobService'
  ],

  implements: [
    'foam.nanos.http.WebAgent'
  ],

  javaImports: [
    'com.itextpdf.text.*',
    'com.itextpdf.text.pdf.PdfWriter',
    'foam.blob.Blob',
    'foam.blob.BlobService',
    'foam.blob.IdentifiedBlob',
    'foam.blob.ProxyBlobService',
    'foam.core.X ',
    'foam.dao.DAO ',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.http.WebAgent',
    'foam.nanos.logger.Logger',
    'foam.dao.ArraySink',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
    'net.nanopay.meter.IpHistory',
    'net.nanopay.model.*',
    'net.nanopay.payment.Institution',
    'org.apache.commons.io.FileUtils',
    'org.apache.commons.io.IOUtils',
    'net.nanopay.invoice.model.Invoice',

    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse',
    'java.io.*',
    'java.text.SimpleDateFormat',
    'java.text.DecimalFormat',
    'java.util.Date',
    'java.util.zip.ZipEntry',
    'java.util.zip.ZipOutputStream',
    'net.nanopay.invoice.model.InvoiceStatus',

    'static foam.mlang.MLang.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
          `
            protected ArraySink dao_;
          `
        }));
      }
    }
  ],

  properties: [
    {
      type: 'Date',
      name: 'startDate'
    },
    {
      type: 'Date',
      name: 'endDate'
    },
    {
      type: 'Boolean',
      name: 'dated'
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
        DAO    userDAO           = (DAO) x.get("localUserDAO");
        DAO    agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");
        Logger logger            = (Logger) x.get("logger");
    
        // PROPERTY SETTING:
        HttpServletRequest req   = x.get(HttpServletRequest.class);
        long id = Integer.parseInt(req.getParameter("userId"));

        if ( id <= 0 ) {
          // TODO user to print Invoice settelmentReport not found.
        }

        startDate = req.getParameter("startDate");
        startDate = req.getParameter("endDate");

        if ( startDate == null || endDate == null ) {
          dated = (false);
        } else {
          dated = (true);
        }

        User business = findUser(x,id);
        filterInvoiceDAO(x, business);
        try {
          // create a temporary folder to save files before zipping
          FileUtils.forceMkdir(new File("/opt/nanopay/SettlementReport/"));
    
          File settlementReport = collectInvoiceDataAndWriteToData(x, business);
    
          if ( settlementReport == null ){
            // TODO: probably just log
          }
    
          downloadZipFile(x, (Business)business, settlementReport);
    
          // delete the temporary folder. Later if we want to archive those files, we can keep the folder.
          FileUtils.deleteDirectory(new File("/opt/nanopay/SettlementReport/"));
        } catch (IOException e) {
          logger.error(e);
        } catch (Throwable t) {
          logger.error("Error generating compliance report package: ", t);
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
        if ( dated ) {
          dao_ = (ArraySink) invoiceDAO.where(
            AND(
              GTE(Invoice.ISSUE_DATE, startDate),
              LTE(Invoice.ISSUE_DATE, endDate)
            ))
          // .orderBy(Desc(Invoice.ISSUE_DATE))
            .select(new ArraySink());
        } else {
          dao_ = (ArraySink) invoiceDAO.where(
            OR(
              EQ(Invoice.PAYER_ID, user.getId()),
              EQ(Invoice.PAYEE_ID, user.getId())
            ))
            //.orderBy(Desc(Invoice.ISSUE_DATE))
            .select(new ArraySink());
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
        DAO   agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");

        User user = (User) userDAO.find(id);
        Business business;
    
        if ( user instanceof Business ) {
          business = (Business) user;
        } else {
          UserUserJunction userUserJunction = (UserUserJunction) agentJunctionDAO.find(EQ(UserUserJunction.SOURCE_ID, user.getId()));
          business = (Business) userDAO.find(userUserJunction.getTargetId());
        }

        return business;
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
        SimpleDateFormat sdf    = new SimpleDateFormat("yyyy-MM-dd");
        String title = "";
        if ( dated ) {
          title = "Invoice Information for " + sdf.format(startDate + " to " + sdf.format(endDate));
        } else {
          title = "Invoice Information";
        }
    
        String path = "/opt/nanopay/SettlementReport/[" + user.getOrganization() + "]SettlementReport.pdf";
    
        try {
          Document document = new Document();
          PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
          document.open();

          document.add(new Paragraph(title));
    
          List list = createListForInvoices(x, user.getOrganization());
    
          document.add(list);
          document.add(Chunk.NEWLINE);
          document.add(new Paragraph("Business ID: " + user.getId()));
    
          document.close();
          writer.close();
    
          return new File(path);
        } catch (DocumentException | FileNotFoundException e) {
          Logger logger            = (Logger) x.get("logger");
          logger.error(e);
        }
    
        return null; 
      `
    },
    {
      name: 'createListForInvoices',
      javaType: 'List<List>',
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
        DAO  userDAO            = (DAO) x.get("localUserDAO");
        SimpleDateFormat df     = new SimpleDateFormat("yyyy/MM/dd, HH:mm:ss");
        SimpleDateFormat sdf    = new SimpleDateFormat("yyyy-MM-dd");
        User temp_U             = null;
        String title            = null;
        java.util.List invoiceArray_ = dao_.getArray();
        // List<List> listList     = new ArrayList<List>();
        List list = new List(List.UNORDERED);

        String transDate = "";
        String createdBy_S = "";
        String businessNamePayer = "";
        String businessNamePayee = "";
        String srcCurrency = "";
        String dstCurrency = "";
        String exRate = "";
        String inStatus = "";
        String tanId = "";
        String inORN = "";
        String inID = "";
        String inAmount = "";
        Invoice invoice = null;
        for ( Object temp : invoiceArray_ ) {
          invoice = (Invoice)temp;
          // Format Information variables for each Invoice
          transDate = df.format(invoice.getPaymentDate());
          temp_U = (User) userDAO.find(invoice.getCreatedBy());
          createdBy_S = temp_U == null ? "n/a" : temp_U.label();
          temp_U = (User) userDAO.find(invoice.getPayerId());
          businessNamePayer = temp_U == null ? "n/a" : temp_U.getOrganization();
          temp_U = (User) userDAO.find(invoice.getPayeeId());
          businessNamePayee = temp_U == null ? "n/a" : temp_U.getOrganization();
          srcCurrency = invoice.getSourceCurrency();
          dstCurrency = invoice.getDestinationCurrency();
          exRate = invoice.getExchangeRate() + "";
          inStatus = ((InvoiceStatus)invoice.getStatus()).getLabel();
          tanId = invoice.getReferenceId();
          inORN = invoice.getPurchaseOrder();
          inID = invoice.getId() + "";
          inAmount = invoice.getAmount() + "";

          // Put all variables with text for each line, for write to doc.pdf(settlementReport) 
          
          list.add(new ListItem("Invoice ID: " + inID + " PO: " + inORN ));
          list.add(new ListItem("\tTransaction Date: " + transDate));
          list.add(new ListItem("\tInvoice was established by: " + createdBy_S));
          list.add(new ListItem("\tPayer: " + businessNamePayer));
          list.add(new ListItem("\tPayee: " + businessNamePayee));
          list.add(new ListItem("\tSource Account Currency Type: " + srcCurrency));
          list.add(new ListItem("\tDestination Account Currency Type: " + dstCurrency));
          if ( exRate != null && exRate.length() != 0 ) {
            list.add(new ListItem("\tExchange Rate: " + exRate));
          }
          list.add(new ListItem("\tStatus of Payment: " + inStatus));
          list.add(new ListItem("\tTransaction ID: " + tanId));
          list.add(new ListItem("\tInvoice Amount: " + inAmount));
          list.add(new ListItem("\n\n"));

          // listList.add(list);
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
        Logger              logger   = (Logger) x.get("logger");
    
        response.setContentType("multipart/form-data");
    
        String businessName = business.getBusinessName();
        String downloadName = "[" + businessName + "]ComplianceDocs.zip";
    
        response.setHeader("Content-Disposition", "attachment;fileName=\"" + downloadName + "\"");
    
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
          logger.error(e);
        } finally {
          IOUtils.closeQuietly(os);
          IOUtils.closeQuietly(zipos);
        }
      `
    }
  ]
});
