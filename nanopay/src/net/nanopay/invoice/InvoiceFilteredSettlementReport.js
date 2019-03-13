foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'InvoiceFilteredSettlementReport',

  documentation: '',

  extends: [
    'foam.blob.ProxyBlobService'
  ],

  implements: [
    'foam.nanos.http.WebAgent'
    // 'foam.nanos.NanoService',
    // 'foam.nanos.notification.email.EmailService'
  ],

  imports: [
    'threadPool?', // Only imported in Java
    'appConfig?'
  ],

  javaImports: [
    // TODO SORT
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.pool.FixedThreadPool',
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets',
    'java.util.Date',
    'java.util.Properties',
    'javax.mail.*',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.MimeMessage',
    'org.apache.commons.lang3.StringUtils',
    'org.jtwig.environment.EnvironmentConfiguration',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.app.AppConfig',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
          `
            public InvoiceFilteredSettlementReport(X x, BlobService delegate) {
              setX(x);
              setDelegate(delegate);
              dated = false;
              dao_ = null;
            }

            protected boolean dated;
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

        if ( id == null || id == 0 ) {
          // TODO user to print Invoice settelmentReport not found.
        }

        setStartDate(Integer.parseInt(req.getParameter("startDate")));
        setEndDate(Integer.parseInt(req.getParameter("endDate")));

        if ( getStartDate() == null || getEndDate() == null || getStartDate() > getEndDate() ) {
          setDated(false);
        } else {
          setDated(true);
        }

        Business business = findUser(id);
    
        try {
          // create a temporary folder to save files before zipping
          FileUtils.forceMkdir(new File("/opt/nanopay/SettlementReport/"));
    
          File settlementReport = collectInvoiceDataAndWriteToData(x, business);
    
          if ( settlementReport == null ){
            // TODO: probably just log
          }
    
          downloadZipFile(x, business, settlementReport);
    
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
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode:
      `
        DAO  invoiceDAO = (DAO) x.get("invoiceDAO");
        if ( getDated() ) {
          dao_ = (ArraySink) invoiceDAO.where(
            AND(
              GTE(Invoice.ISSUE_DATE, startDate),
              LTE(Invoice.ISSUE_DATE, endDate)
            ))
            .orderBy(Desc(Invoice.ISSUE_DATE))
            .select(new ArraySink);
        } else {
          dao_ = (ArraySink) invoiceDAO.where(
            AND(
              GTE(Invoice.ISSUE_DATE, startDate),
              LTE(Invoice.ISSUE_DATE, endDate)
            ))
            .orderBy(Desc(Invoice.ISSUE_DATE))
            .select(new ArraySink);
        }
        
      `
    },
    {
      name: 'findUser',
      javaType: 'foam.nanos.auth.User',
      args: [
        {
          name: 'id',
          type: 'String'
        }
      ],
      javaCode:
      `
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
        if ( getDated() ) {
          title = "Invoice Information for " + sdf.format(getStartDate()) + " to " + sdf.format(getEndDate());
        } else {
          title = "Invoice Information";
        }
    
        String path = "/opt/nanopay/SettlementReport/[" + business.getOrganization() + "]SettlementReport.pdf";
    
        try {
          Document document = new Document();
          PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
          document.open();

          document.add(new Paragraph(title));
    
          List list = createListForOneInvoice(x, business.getOrganization());
    
          document.add(list);
          document.add(Chunk.NEWLINE);
          document.add(new Paragraph("Business ID: " + business.getId()));
          document.add(new Paragraph("Report Generated Date: " + reportGeneratedDate));
    
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
      name: 'createListForOneInvoice',
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
        Invoice[] invoiceArray_ = dao_.getArray();
        List<List> listList     = new ArrayList<List>();
        List list               = null;

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
        
        for ( Invoice invoice : invoiceArray_ ) {
          // Format Information variables for each Invoice
          businessName = user.getOrganization();
          transDate = df.format(invoice.getPaymentDate());
          temp_U = (User) userDAO.find(invoice.getCreatedBy());
          createdBy_S = temp_U == null ? 'n/a' : temp_U.label();
          temp_U = (User) userDAO.find(invoice.getPayerId);
          businessNamePayer = temp_U == null ? 'n/a' : temp_U.getOrganization;
          temp_U = (User) userDAO.find(invoice.getPayeeId);
          businessNamePayee = temp_U == null ? 'n/a' : temp_U.getOrganization;
          srcCurrency = invoice.getSourceCurrency();
          dstCurrency = invoice.getDestinationCurrency();
          exRate = invoice.getExchangeRate();
          inStatus = ((InvoiceStatus)invoice.getStatus()).getLabel();
          tanId = invoice.getReferenceId();
          inORN = invoice.getPurchaseOrder();
          inID = invoice.getId();
          inAmount = invoice.getAmount() + "";

          // Put all variables with text for each line, for write to doc.pdf(settlementReport) 
          list = new List(List.UNORDERED);
          list.add(new ListItem("Invoice ID: " + inID + " PO: " + inORN ));
          list.add(new ListItem("\tTransaction Date: " + transDate));
          list.add(new ListItem("\tInvoice was established by: " + createdBy_S));
          list.add(new ListItem("\tPayer: " + businessNamePayer));
          list.add(new ListItem("\tPayee: " + businessNamePayee));
          list.add(new ListItem("\tSource Account Currency Type: " + srcCurrency));
          list.add(new ListItem("\tDestination Account Currency Type: " + dstCurrency));
          if ( exRate != null && exRate.length() != 0 ) {
            list.add(new ListItem(\t"Exchange Rate: " + exRate));
          }
          list.add(new ListItem("\tStatus of Payment: " + inStatus));
          list.add(new ListItem("\tTransaction ID: " + tanId));
          list.add(new ListItem("\tInvoice Amount: " + inAmount));
          list.add(new ListItem("\n\n"));

          listList.add(list);
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
