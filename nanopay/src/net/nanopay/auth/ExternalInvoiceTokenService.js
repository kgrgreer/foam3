foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ExternalInvoiceTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: `The external token service provides two functionalities.
    Generating/storing tokens and associating them to the created email templates
    associated to the request. The second feature consists of processing
    tokens, checking validity and registering the users to the platform
    by enabling them within the system. *NOTE* Generating token requires a hashmap
    containing an "invoice" key with a value of an invoice object.
  `,

   imports: [
    'appConfig',
    'bareUserDAO',
    'currencyDAO',
    'email',
    'invoiceDAO',
    'userUserDAO',
    'logger',
    'tokenDAO'
  ],

   javaImports: [
    'foam.core.FObject',
    'foam.dao.*',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'foam.util.Password',
    'foam.util.SafetyUtil',
    'java.lang.Object',
    'java.lang.StringBuilder',
    'java.net.URLEncoder',
    'java.text.NumberFormat',
    'java.text.SimpleDateFormat',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.model.Business',
    'net.nanopay.model.Currency',
    'net.nanopay.contacts.Contact'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode:
      `
      Logger logger = (Logger) getLogger();

      try {
        DAO tokenDAO = (DAO) getTokenDAO();
        DAO invoiceDAO = (DAO) getInvoiceDAO();
        DAO bareUserDAO = (DAO) getBareUserDAO();
        DAO currencyDAO = (DAO) getCurrencyDAO();
        EmailService emailService = (EmailService) getEmail();

        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");
        String emailTemplate;
        String inviteEmail;
        User loginUser = new User();

        // Requires hash map with invoice in parameters to redirect user to invoice after registration.
        if ( parameters.get("invoice") == null ) {
          throw new RuntimeException("Required hash map parameters: invoice");
        }

        // Get invoice for redirect. To be placed as param on email link.
        Invoice invoice = (Invoice) parameters.get("invoice");
        long invoiceId = invoice.getId();

        boolean invType = invoice.getPayeeId() == invoice.getCreatedBy();
        PublicUserInfo payee = invoice.getPayee();
        PublicUserInfo payer = invoice.getPayer();

        // Receivable
        if ( user.getEmail().equals(payee.getEmail()) ) {
          inviteEmail = payee.getEmail();
          loginUser = (User) bareUserDAO.find(payer.getId());
        } else {
          inviteEmail = payer.getEmail();
          loginUser = (User) bareUserDAO.find(payee.getId());
        }

        // Create new token and associate passed in external user to token.
        Token token = new Token();
        parameters.put("inviteeEmail", inviteEmail);
        token.setParameters(parameters);
        token.setUserId(user.getId());
        token.setExpiry(generateExpiryDate());
        token.setData(UUID.randomUUID().toString());
        token = (Token) tokenDAO.put(token);

        // Determines email template to be sent based on status.
        if (
          invoice.getStatus() == InvoiceStatus.PAID ||
          invoice.getStatus() == InvoiceStatus.PENDING_ACCEPTANCE
        ) {
          // For now we aren't going to send out an email when the invoice has
          // been paid.
          return true;
        } else {
          // If the external userId is equal to payeeId, then it is a payable
          emailTemplate = user.getId() == invoice.getPayeeId() ? "external-payable" : "external-receivable";
        }

        EmailMessage message = new EmailMessage.Builder(x)
          .setTo(new String[] { user.getEmail() })
          .build();
        HashMap<String, Object> args = new HashMap<>();

        Group group = loginUser.findGroup(x);
        AppConfig appConfig = group.getAppConfig(x);
        String url = appConfig.getUrl().replaceAll("/$", "");

        // Construct the url of the external invoice
        StringBuilder urlStringB = new StringBuilder();
        urlStringB.append(url + "/?invoiceId=" + invoiceId);
        urlStringB.append("&token=" + token.getData());

        // If user.getEmail() is equal to payee.getEmail(), then it is a receivable
        try {
          urlStringB.append("&email=" + URLEncoder.encode(inviteEmail, "UTF-8"));
        } catch(Exception e) {
          logger.error("Error encoding the email.", e);
          throw new RuntimeException(e);
        }

        urlStringB.append("#sign-up");

        // Sets arguments on email.
        if ( invoice.getDueDate() != null ) {
          args.put("date", dateFormat.format(invoice.getDueDate()));
        }

        args.put("name", user.getFirstName());
        args.put("amount", currencyDAO.find(((Currency) currencyDAO.find(invoice.getDestinationCurrency())).format(
              invoice.getAmount()) + " " + invoice.getDestinationCurrency()));
        if ( ! SafetyUtil.isEmpty(invoice.getInvoiceNumber()) ) {
          args.put("invoiceNumber", invoice.getInvoiceNumber());
        }
        args.put("fromEmail", invType ? payee.getEmail() : payer.getEmail());
        args.put("fromName", invType ? payee.label() : payer.label());
        args.put("email", user.getEmail());
        args.put("link", urlStringB.toString());
        emailService.sendEmailFromTemplate(x, user, message, emailTemplate, args);

        return true;
      } catch (Throwable t) {
        logger.error("Error generating contact token.", t);
        throw new RuntimeException(t.getMessage());
      }`
    },
    {
      name: 'processToken',
      javaCode:
      `
        Logger logger = (Logger) getLogger();
        try {
          DAO userUserDAO = (DAO) getUserUserDAO();
          DAO bareUserDAO = (DAO) getBareUserDAO();
          DAO tokenDAO = (DAO) getTokenDAO();

          // Does not process token if password not provided.
          if ( user == null || SafetyUtil.isEmpty(user.getDesiredPassword()) ) {
            throw new RuntimeException("Cannot leave password field empty");
          }

          Calendar calendar = Calendar.getInstance();

          // Attempts to find corresponding non expired, unprocessed token.
          Token result = (Token) tokenDAO.find(AND(
          EQ(Token.PROCESSED, false),
          GT(Token.EXPIRY, calendar.getTime()),
          EQ(Token.DATA, token)
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
          User realUser = (User) userUserDAO.find(
            AND(
              EQ(User.EMAIL, user.getEmail()),
              NOT(INSTANCE_OF(Contact.class)),
              NOT(INSTANCE_OF(Business.class))
            )
          );

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

          // Set user email verified & login enabled to true to enable log in.
          user.setEmailVerified(true);
          user.setLoginEnabled(true);
          user.setGroup("sme");
          userUserDAO.put(user);

          // Set token processed to true.
          clone.setProcessed(true);
          tokenDAO.put(clone);

          return true;
        } catch (Throwable t) {
          logger.error("Error processing contact token", t);
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
