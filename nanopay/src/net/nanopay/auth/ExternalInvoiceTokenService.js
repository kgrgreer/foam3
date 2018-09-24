foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ExternalInvoiceTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  description: `The external token service provides two functionalities.
    Generating/storing tokens and associating them to the created email templates 
    associated to the request. The second feature consists of processing
    tokens, checking validity and registering the users to the platform 
    by enabling them within the system.
  `,

   imports: [
    'appConfig',
    'bareUserDAO',
    'email',
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
    'net.nanopay.invoice.model.Invoice'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode:
      `try {
        DAO tokenDAO = (DAO) getX().get("tokenDAO");
        DAO invoiceDAO = (DAO) getX().get("invoiceDAO");
        EmailService emailService = (EmailService) getX().get("email");
        AppConfig appConfig = (AppConfig) getX().get("appConfig");

        NumberFormat formatter = NumberFormat.getCurrencyInstance();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");
        String url = appConfig.getUrl()
              .replaceAll("/$", "");
        String emailTemplate;

        // Requires hash map with invoice in parameters to redirect user to invoice after registration.
        if (parameters.get("invoice") == null) {
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

        // Determines email template to be sent based on paymentId.
        if ( ! invoice.getPaymentId().equals("") ) {
          emailTemplate = "external-invoice-payment";
        } else {
          emailTemplate = "external-invoice";
        }

        EmailMessage message = new EmailMessage.Builder(getX())
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
        args.put("name", user.getFirstName());
        args.put("amount", formatter.format(invoice.getAmount()/100.00));
        args.put("account", invoice.getId());
        args.put("fromEmail", invType ? payee.getEmail() : payer.getEmail());
        args.put("fromName", invType ? payee.label() : payer.label());
        args.put("email", user.getEmail());
        args.put("link", url + "/#sign-up?invoiceId=" + invoiceId + "&token=" + token.getData());
        emailService.sendEmailFromTemplate(user, message, emailTemplate, args);
        
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
        DAO localUserDAO = (DAO) getX().get("localUserDAO");
        DAO userDAO = (DAO) getX().get("bareUserDAO");
        DAO tokenDAO = (DAO) getX().get("tokenDAO");

        // Does not process token if password not provided.
        if ( user == null || SafetyUtil.isEmpty(user.getDesiredPassword()) ) {
          throw new RuntimeException("Cannot leave password field empty");
        }

        Calendar calendar = Calendar.getInstance();
        Sink sink = new ArraySink();

        // Attempts to find corresponding non expired, unprocessed token.
        sink = tokenDAO.where(MLang.AND(
        MLang.EQ(Token.PROCESSED, false),
        MLang.GT(Token.EXPIRY, calendar.getTime()),
        MLang.EQ(Token.DATA, token)
        )).limit(1).select(sink);
        List list = ((ArraySink) sink).getArray();

        if ( list == null || list.size() == 0 ) {
          // Token not found.
          throw new RuntimeException("Token not found or has expired.");
        }

        FObject result = (FObject) list.get(0);
        Token clone = (Token) result.fclone();
        User existingUser = (User) userDAO.find(clone.getUserId());

        // Does not process token if new user email address does not match token user email address.
        if ( ! existingUser.getEmail().equals(user.getEmail()) ) {
          throw new RuntimeException("Email does not match with token request.");
        }

        // Does not set password and processes token if user exists.
        sink = new ArraySink();

        sink = localUserDAO.where(MLang.EQ(User.EMAIL, user.getEmail()))
            .limit(1).select(sink);

        list = ((ArraySink) sink).getArray();

        if ( list != null && list.size() != 0 ) {
          // User already exists.
          clone.setProcessed(true);
          tokenDAO.put(clone);
          throw new RuntimeException("A user already exists with that email address.");
        }

        // Update user's password & enable.
        String newPassword = user.getDesiredPassword();
        user.setDesiredPassword(null);
        user.setPassword(Password.hash(newPassword));
        user.setPasswordExpiry(null);
        user.setPasswordLastModified(Calendar.getInstance().getTime());

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
        }`
    }
  ]
});
