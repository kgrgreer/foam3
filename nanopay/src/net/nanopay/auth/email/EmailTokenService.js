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
  package: 'net.nanopay.auth.email',
  name: 'EmailTokenServiceRefine',
  refines: 'foam.nanos.auth.email.EmailTokenService',

  imports: [
    'Logger logger'
  ],

  javaImports: [
    'foam.nanos.app.AppConfig',
    'foam.nanos.logger.Logger',
    'foam.util.Emails.EmailsUtility'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode: `
        try {
          DAO tokenDAO = (DAO) x.get("localTokenDAO");
          AppConfig appConfig = user.findGroup(x).getAppConfig(x);
          String url = appConfig.getUrl();

          Token token = new Token();
          token.setUserId(user.getId());
          token.setExpiry(generateExpiryDate());
          token.setData(UUID.randomUUID().toString());
          token = (Token) tokenDAO.put(token);

          EmailMessage message = new EmailMessage();
          message.setTo(new String[]{user.getEmail()});

          HashMap<String, Object> args = new HashMap<>();
          args.put("name", user.getUserName());
          args.put("email", user.getEmail());
          args.put("link", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=/");
          args.put("sendTo", user.getEmail());

          // add app store / play store links
          if ( "Personal".equals(user.getType()) && user.getPortalAdminCreated() ) {
            args.put("applink", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect="+appConfig.getAppLink());
            args.put("playlink", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect="+appConfig.getPlayLink());
          }

          String template = (user.getWelcomeEmailSent())? "verifyEmail" : "welcome-email";
          EmailsUtility.sendEmailFromTemplate(x, user, message, template, args);
          return true;
        } catch (Throwable t) {
          ((Logger) getLogger()).error(t);
          return false;
        }
      `
  }
  ]
});
