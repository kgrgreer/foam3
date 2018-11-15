foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ExternalInvoiceTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  description: `The external token service provides two functionalities.
    Generating/storing tokens and associating them to the created email templates 
    associated to the request. The second feature consists of processing
    tokens, checking validity and registering the users to the platform 
    by enabling them within the system. *NOTE* Generating token requires a hashmap
    containing an "invoice" key with a value of an invoice object.
  `,

   imports: [
    'appConfig',
    'bareUserDAO',
    'email',
    'invoiceDAO',
    'localUserDAO',
    'logger',
    'tokenDAO'
  ],

   javaImports: [
    'foam.core.FObject',
    'foam.dao.*',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'foam.util.Password',
    'foam.util.SafetyUtil',
    'java.lang.Object',
    'java.text.NumberFormat',
    'java.text.SimpleDateFormat',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode:
      `try {
        DAO tokenDAO = (DAO) getTokenDAO();
        DAO invoiceDAO = (DAO) getInvoiceDAO();
        EmailService emailService = (EmailService) getEmail();
        AppConfig appConfig = (AppConfig) getAppConfig();

        NumberFormat formatter = NumberFormat.getCurrencyInstance();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");
        String url = appConfig.getUrl()
              .replaceAll("/$", "");
        String emailTemplate;

        // Requires hash map with invoice in parameters to redirect user to invoice after registration.
        if ( parameters.get("invoice") == null ) {
          throw new RuntimeException("Required hash map parameters: invoice");
        }
        
        // Get invoice for redirect. To be placed as param on email link.
        Invoice invoice = (Invoice) parameters.get("invoice");
        long invoiceId = invoice.getId();

        // Create new token and associate passed in external user to token.
        Token token = new Token();        
        token.setParameters(parameters);
        token.setUserId(user.getId());
        token.setExpiry(generateExpiryDate());
        token.setData(UUID.randomUUID().toString());
        token = (Token) tokenDAO.put(token);

        // Determines email template to be sent based on status.
        if ( invoice.getStatus().equals(InvoiceStatus.PAID) || invoice.getStatus().equals(InvoiceStatus.PENDING_ACCEPTANCE) ) {
          emailTemplate = "external-invoice-payment";
        } else {
          emailTemplate = "external-invoice";
        }

        EmailMessage message = new EmailMessage.Builder(x)
          .setTo(new String[] { user.getEmail() })
          .build();
        HashMap<String, Object> args = new HashMap<>();

        boolean invType = (long) invoice.getPayeeId() == (Long)invoice.getCreatedBy();
        PublicUserInfo payee = invoice.getPayee();
        PublicUserInfo payer = invoice.getPayer();
        
        // Sets arguments on email.
        if ( invoice.getDueDate() != null ) {
          args.put("date", dateFormat.format(invoice.getDueDate()));
        }

        // TODO: Arguments and email templates are set to change once email templates are finalized.
        args.put("name", user.getFirstName());
        // TODO: Replace formatter with  Currency.format once PR #3688 is merge.
        args.put("amount", formatter.format(invoice.getAmount()/100.00));
        if ( ! SafetyUtil.isEmpty(invoice.getInvoiceNumber()) ) {
          args.put("invoiceNumber", invoice.getInvoiceNumber());
        }
        args.put("fromEmail", invType ? payee.getEmail() : payer.getEmail());
        args.put("fromName", invType ? payee.label() : payer.label());
        args.put("email", user.getEmail());
        args.put("link", url + "/#sign-up?invoiceId=" + invoiceId + "&token=" + token.getData());
        emailService.sendEmailFromTemplate(x, user, message, emailTemplate, args);

        return true;
      } catch (Throwable t) {
        ((Logger) getLogger()).error("Error generating contact token", t);
        throw new RuntimeException(t.getMessage());
      }`
    },
    {
      name: 'processToken',
      javaCode:
      `
        try {
          DAO localUserDAO = (DAO) getLocalUserDAO();
          DAO bareUserDAO = (DAO) getBareUserDAO();
          DAO tokenDAO = (DAO) getTokenDAO();
          Logger logger = (Logger) getLogger();

          // Does not process token if password not provided.
          if ( user == null || SafetyUtil.isEmpty(user.getDesiredPassword()) ) {
            throw new RuntimeException("Cannot leave password field empty");
          }

          Calendar calendar = Calendar.getInstance();

          // Attempts to find corresponding non expired, unprocessed token.
          Token result = (Token) tokenDAO.find(MLang.AND(
          MLang.EQ(Token.PROCESSED, false),
          MLang.GT(Token.EXPIRY, calendar.getTime()),
          MLang.EQ(Token.DATA, token)
          ));

          if ( result == null ) {
            // Token not found.
            logger.warning("Token not found or has expired.");
            throw new RuntimeException("Registration failed due to expired invitation. Please request an invite or sign up directly.");
          }

          // FObject result = (FObject) list.get(0);
          Token clone = (Token) result.fclone();
          User existingUser = (User) bareUserDAO.find(clone.getUserId());

          // Does not process token if new user email address does not match token user email address.
          if ( ! SafetyUtil.equals(existingUser.getEmail(), user.getEmail()) ) {
            throw new RuntimeException("Email does not match with token request.");
          }

          // Does not set password and processes token if user exists.
          User realUser = (User) localUserDAO.find(MLang.EQ(User.EMAIL, user.getEmail()));

          if ( realUser != null ) {
            clone.setProcessed(true);
            tokenDAO.put(clone);
            throw new RuntimeException("A user already exists with that email address.");
          }

          // Update user's password & enable.
          String newPassword = user.getDesiredPassword();
          user.setDesiredPassword(null);
          user.setPassword(Password.hash(newPassword));
          user.setPasswordExpiry(null);
          user.setPasswordLastModified(calendar.getTime());

          // Set user email verified & enabled to true to enable log in.
          user.setEmailVerified(true);
          user.setEnabled(true);
          user.setGroup("sme");
          localUserDAO.put(user);

          // Set token processed to true.
          clone.setProcessed(true);
          tokenDAO.put(clone);

          return true;
        } catch (Throwable t) {
          ((Logger) getLogger()).error("Error processing contact token", t);
          throw new RuntimeException(t.getMessage());
        }
      `
    },
    {
      name: 'generateExpiryDate',
      javaCode:
      `
        /* 
          TODO: Configurable expiration time based on application and/or spid config.
          Capable of removing this override considering expiration configuration will 
          exist on the super class (ie. AbstractTokenService).
         */
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 30);
        return calendar.getTime();
      `
    }
  ]
});
