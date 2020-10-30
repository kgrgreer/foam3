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
  package: 'net.nanopay.onboarding.email',
  name: 'RegistrationSubmissionEmailDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'java.util.HashMap',

    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'net.nanopay.admin.model.AccountStatus'
  ],

  messages: [
    { name: 'PENDING_SUBMISSION_EMAIL_SEND_ERROR_MSG', message: 'Error sending pending submission email' },
    { name: 'ADMIN_NOTIF_SUBMISSION_EMAIL_SEND_ERROR_MSG', message: 'Error sending admin notification submission email' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public RegistrationSubmissionEmailDAO(X x, DAO delegate) {
            super(x, delegate);
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        // Checks if User exists and is login enabled.
        User user = (User) obj;
        if ( find(user.getId()) == null || ! user.getLoginEnabled())
          return getDelegate().put_(x, obj);

        //Makes sure to only send on status change
        User oldUser = (User) getDelegate().find(user.getId());
        if ( ! AccountStatus.PENDING.equals(oldUser.getStatus()) || ! AccountStatus.SUBMITTED.equals(user.getStatus()) )
          return getDelegate().put_(x, obj);

        user = (User) super.put_(x , obj);
        User                      admin        = (User) getDelegate().find(user.getInvitedBy());
        String                    url           = admin.findGroup(x).getAppConfig(x).getUrl();
        EmailMessage            message      = new EmailMessage();
        EmailMessage            adminMessage = new EmailMessage();
        HashMap<String, Object> args         = new HashMap<>();

        message.setTo(new String[]{user.getEmail()});
        args.put("name",        user.getFirstName());
        args.put("lastName",    user.getLastName());
        args.put("id",          user.getId());
        args.put("link",        url);
        args.put("memberLink",  url+"#members");

        try {
          EmailsUtility.sendEmailFromTemplate(x, user, message, "reg-pending", args);
        } catch (Throwable t) {
          (x.get(Logger.class)).error(PENDING_SUBMISSION_EMAIL_SEND_ERROR_MSG, t);
        }

        adminMessage.setTo(new String[]{admin.getEmail()});
        try {
          EmailsUtility.sendEmailFromTemplate(x, admin, adminMessage, "reg-note", args);
        } catch (Throwable t) {
          (x.get(Logger.class)).error(ADMIN_NOTIF_SUBMISSION_EMAIL_SEND_ERROR_MSG, t);
        }
        return user;
      `
    }
  ]
});
