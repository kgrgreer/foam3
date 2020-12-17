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
  package: 'net.nanopay.onboarding',
  name: 'InvitationTokenService',
  extends: 'foam.nanos.auth.email.EmailTokenService',

  imports: [
    'DAO localUserDAO',
    'DAO tokenDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'foam.util.Password',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.UUID',
    'org.apache.commons.text.CharacterPredicates',
    'org.apache.commons.text.RandomStringGenerator'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
`protected static RandomStringGenerator passgen = new RandomStringGenerator.Builder()
    .filteredBy(CharacterPredicates.LETTERS, CharacterPredicates.DIGITS)
    .withinRange('0', 'z')
    .build();`
        }));
      }
    }
  ],

  methods: [
    {
      name: 'generateExpiryDate',
      javaCode:
`Calendar calendar = Calendar.getInstance();
calendar.add(Calendar.DAY_OF_MONTH, 14);
return calendar.getTime();`
    },
    {
      name: 'generateToken',
      javaCode:
      `try {
        DAO tokenDAO = (DAO) getTokenDAO();
        DAO userDAO = (DAO) getLocalUserDAO();

        // keep generating a new password until a valid one is generated
        String password = passgen.generate(18);
        while ( ! Password.isValid(getX(), user, password) ) {
          password = passgen.generate(18);
        }
        user = (User) user.fclone();
        user.setPassword(Password.hash(password));
        user.setPasswordExpiry(generateExpiryDate());

        // save password and generate a valid id.
        user = (User) userDAO.put(user);
        String url = user.findGroup(x).getAppConfig(x).getUrl();
       
        Token token = new Token();
        token.setUserId(user.getId());
        token.setExpiry(generateExpiryDate());
        token.setData(UUID.randomUUID().toString());
        token = (Token) tokenDAO.put(token);

        EmailMessage message = new EmailMessage.Builder(getX())
          .setTo(new String[] { user.getEmail() })
          .build();

        HashMap<String, Object> args = new HashMap<>();
        args.put("name", user.getFirstName());
        args.put("email", user.getEmail());
        args.put("link", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=/");
        args.put("password", password);

        EmailsUtility.sendEmailFromTemplate(x, user, message, "welcome-email", args);

        user = (User) user.fclone();
        user.setInviteAttempts(user.getInviteAttempts() + 1);
        userDAO.put(user);
        
        return true;
      } catch (Throwable t) {
        ((Logger) getLogger()).error("Error generating invitation", t);
        throw new RuntimeException(t.getMessage());
      }`
    }
  ]
});
