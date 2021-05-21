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
  package: 'net.nanopay.partners',
  name: 'SendInvitationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.token.Token',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'net.nanopay.contacts.Contact',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.model.Business',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus',
    'net.nanopay.partners.ui.PartnerInvitationNotification',

    'java.io.UnsupportedEncodingException',
    'java.net.URLEncoder',
    'java.nio.charset.StandardCharsets',
    'java.util.Calendar',
    'java.util.concurrent.TimeUnit',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.UUID',
    'foam.util.SafetyUtil'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public SendInvitationDAO(X x, DAO delegate) {
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
        User user = ((Subject) x.get("subject")).getUser();
        Invitation invite = (Invitation) obj.fclone();

        long hoursSinceLastSend = getHoursSinceLastSend(invite);
        boolean noResponse = invite.getStatus() == InvitationStatus.SENT;
        boolean isInviter = invite.getCreatedBy() == user.getId();

        // if this is a new invitation, get the id first
        if ( invite.getId() == 0 ) {
          invite = (Invitation) super.put_(x, invite).fclone();
        }

        if ( hoursSinceLastSend >= 2 && noResponse && isInviter ) {
          Map tokenParams = new HashMap();
          tokenParams.put("inviteeEmail", invite.getEmail());

          DAO tokenDAO = (DAO) x.get("localTokenDAO");
          Token token = new Token();
          token.setParameters(tokenParams);
          token.setExpiry(this.generateExpiryDate());
          String tokenData = UUID.randomUUID().toString();
          token.setData(tokenData);
          token = (Token) tokenDAO.put(token);

          invite.setTokenData(tokenData);

          sendInvitationEmail(x, invite, user);

          if ( invite.getIsContact() ) {
            // Update the contact's status to invited.
            DAO contactDAO = (DAO) x.get("localContactDAO");
            Contact recipient = (Contact) contactDAO.find(invite.getInviteeId()).fclone();

            if ( recipient.getBusinessId() != 0 ) {
              Business business = (Business) getDelegate().inX(x).find(recipient.getBusinessId());
              if ( business != null ) {
                recipient.setSignUpStatus(ContactStatus.READY);
              }
            } else if ( ! SafetyUtil.isEmpty(recipient.getBankAccount()) ) {
              recipient.setSignUpStatus(ContactStatus.READY);
            }

            contactDAO.put(recipient);
          }

          if ( invite.getInternal() ) {
            // Send the internal user a notification.
            DAO userDAO = (DAO) x.get("localUserDAO");
            User recipient = (User) userDAO.inX(x).find(invite.getInviteeId());
            sendInvitationNotification(x, user, recipient, invite);
          }

          invite.setTimestamp(new Date());
        }
        return super.put_(x, invite);
      `
    },
    {
      name: 'getHoursSinceLastSend',
      visibility: 'protected',
      type: 'long',
      args: [
        { type: 'Invitation', name: 'invite' }
      ],
      documentation: `
        Get the number of hours since the given invitation was last sent
          @param {Invitation} invite The invitation to check
          @returns {long} The number of hours since last sent
      `,
      javaCode: `
        TimeUnit hoursUnit = TimeUnit.HOURS;
        Date now = new Date();
        long diff = now.getTime() - invite.getTimestamp().getTime();
        // NOTE: convert() will truncate down to the nearest full hour
        return hoursUnit.convert(diff, TimeUnit.MILLISECONDS);
      `
    },
    {
      name: 'sendInvitationEmail',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Invitation', name: 'invite' },
        { type: 'User', name: 'currentUser' }
      ],
      documentation: `
        Send an email invitation
        @param {X} x The context
        @param {Invitation} invite The invitation to send
        @param {User} currentUser The current user
      `,
      javaCode: `
        User agent = ((Subject) x.get("subject")).getRealUser();
        AppConfig config = (AppConfig) x.get("appConfig");
        Logger logger = (Logger) getX().get("logger");
        EmailMessage message = new EmailMessage();
        message.setTo(new String[]{invite.getEmail()});
        HashMap<String, Object> args = new HashMap<>();

        // Choose the appropriate email template.
        String template = invite.getInternal() ?
            "partners-internal-invite" :
            "partners-external-invite";

        // Populate the email template.
        String url = agent.findGroup(x).getAppConfig(x).getUrl();
        String urlPath = invite.getInternal() ? "#notifications" : "#sign-up";

        if ( invite.getIsContact() ) {
          template = "contact-invite";
          try {
            urlPath = "?email="
              + URLEncoder.encode(invite.getEmail(), StandardCharsets.UTF_8.name())
              + "&token="
              + URLEncoder.encode(invite.getTokenData(), StandardCharsets.UTF_8.name())
              + "#sign-up";
          } catch (UnsupportedEncodingException e) {
            logger.error("Error generating contact token: ", e);
            throw new RuntimeException("Failed to encode URL parameters.", e);
          }
        }

        args.put("message", invite.getMessage());
        args.put("name", invite.getBusinessName() != null ? invite.getBusinessName() : invite.getInvitee().toSummary());
        args.put("senderCompany", currentUser.toSummary());
        args.put("link", url + urlPath);
        args.put("sendTo", invite.getEmail());

        try {
          EmailsUtility.sendEmailFromTemplate(x, currentUser, message, template, args);
        } catch(Throwable t) {
          logger.error("Error sending invitation email.", t);
        }
      `
    },
    {
      name: 'generateExpiryDate',
      visibility: 'protected',
      type: 'Date',
      documentation: 'Get a 30 day expiry date',
      javaCode: `
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 30);
        return calendar.getTime();
      `
    },
    {
      name: 'sendInvitationNotification',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'User', name: 'currentUser' },
        { type: 'User', name: 'recipient' },
        { type: 'Invitation', name: 'invitation' }
      ],
      documentation: `
        Send a notification inviting the user to connect
        @param {DAO} notificationDAO The notification DAO to write to
        @param {User} currentUser The current user
        @param {User} recipient The user being invited
      `,
      javaCode: `
        PartnerInvitationNotification notification = new PartnerInvitationNotification();
        notification.setUserId(recipient.getId());
        notification.setCreatedBy(currentUser.getId());
        notification.setInviterName(currentUser.getLegalName());
        notification.setNotificationType("Partner invitation");
        notification.setInvitationId(invitation.getId());
        recipient.doNotify(getX(), notification);
      `
    }
  ]
});

