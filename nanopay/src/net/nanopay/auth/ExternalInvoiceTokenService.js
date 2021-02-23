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
    'DAO bareUserDAO',
    'currencyDAO',
    'invoiceDAO',
    'DAO userUserDAO',
    'Logger logger',
    'DAO tokenDAO'
  ],

   javaImports: [
    'foam.dao.*',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'foam.util.Password',
    'foam.util.SafetyUtil',
    'java.net.URLEncoder',
    'java.text.SimpleDateFormat',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.UUID',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Business',
    'net.nanopay.contacts.Contact'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode:
      `
      // Generates a token and sets link on the template args(Map)

      Logger logger = (Logger) getLogger();

      try {
        if ( ! (parameters.get("template") instanceof String) || SafetyUtil.isEmpty((String)parameters.get("template")) )
          throw new RuntimeException("Required hash map parameters: template");

        String template = (String) parameters.get("template");

        DAO tokenDAO = (DAO) getTokenDAO();

        // Create new token and associate passed in external user to token.
        HashMap tokenParams = new HashMap();
        tokenParams.put("inviteeEmail", user.getEmail());

        Token token = new Token();
        token.setParameters(tokenParams);
        token.setUserId(user.getId());
        token.setExpiry(generateExpiryDate());
        token.setData(UUID.randomUUID().toString());
        token = (Token) tokenDAO.put(token);

        EmailMessage message = new EmailMessage.Builder(x)
          .setTo(new String[] { user.getEmail() })
          .build();

        Group group = user.findGroup(x);
        AppConfig appConfig = group.getAppConfig(x);
        String url = appConfig.getUrl();

        // Construct the url of the external invoice
        StringBuilder urlStringB = new StringBuilder();
        urlStringB.append(url + "/?invoiceId=" + parameters.get("invoiceId"));
        urlStringB.append("&token=" + token.getData());
        try {
          urlStringB.append("&email=" + URLEncoder.encode(user.getEmail(), "UTF-8"));
        } catch(Exception e) {
          logger.error("Error encoding the email.", e);
          throw new RuntimeException(e);
        }
        urlStringB.append("#sign-up");

        parameters.put("link", urlStringB.toString());
        parameters.put("name", user.getFirstName());
        parameters.put("sendTo", user.getEmail());
        EmailsUtility.sendEmailFromTemplate(x, user, message, template, parameters);

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

          Token clone = (Token) result.fclone();
          // This is the current user - happy path is such that existingUser is the contact we want to replace
          User existingUser = (User) bareUserDAO.find(clone.getUserId());

          // Does not process token if new user email address does not match token user email address.
          if ( ! SafetyUtil.equals(existingUser.getEmail(), user.getEmail()) ) {
            throw new RuntimeException("Email does not match with token request.");
          }

          // Does not set password and processes token if user exists.
          // *So User is the new user we are creating,
          // *existingUser is the contact - and
          // *realUser attempts to see if existingUser has already become an active user.
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
          user.setGroup(user.getSpid() + "-sme");
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
