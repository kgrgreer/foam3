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
  package: 'net.nanopay.sme.cron',
  name: 'SigningOfficerReminderCron',
  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'foam.util.SafetyUtil',
    'java.net.URLEncoder',
    'java.util.Arrays',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'net.nanopay.model.Business',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus',
    'static foam.mlang.MLang.*',
  ],

  documentation: `Send reminder invite to signing officers to join a business or join the system at incremental times.
  Incremental times are 1 day, 1 week, and 2 weeks of inactivity
  Does this in steps: (NOT THE CLEANEST OR MOST REUSABLE CODE)
  // SELECT ALL BUSINESSES
    // FOR EACH BUSINESS
      // LOCATE the last time a reminder email was sent.
      // DETERMINE if one of the time conditions are satified
      // REGENERATE URL
      // SEND EMAIL
  `,

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
        EmailMessage             message    = null;
        Map<String, Object>         args    = null;
        Logger                    logger    = (Logger) x.get("logger");
        DAO                  businessDAO    = (DAO) x.get("businessDAO");
        DAO        businessInvitationDAO    = (DAO) x.get("businessInvitationDAO");
        long[]              intervalArray    = timeIntervalsBasedOnAppMode(x);
        if ( intervalArray == null ) {
          logger.warning("@SigningOfficerReminderCron no appConfig found.");
          return;
        }
        
        // SELECT ALL BUSINESSES
        List<Business> businessList = ((ArraySink) businessDAO
          .where(EQ(Business.DELETED, false))
          .select(new ArraySink())).getArray();
        
          // FOR EACH BUSINESS
        for ( Business business : businessList ) {
          // LOCATE an invitation that was unsent
          Invitation invitation = (Invitation) businessInvitationDAO
            .find(
              AND(
                EQ(Invitation.GROUP, business.getSpid() + "-admin"),
                EQ(Invitation.CREATED_BY, business.getId()),
                EQ(Invitation.STATUS, InvitationStatus.SENT)
              )
            );

          if ( invitation == null ) continue;
          
          if (! determineIfTimeConditionSatified(x, invitation, intervalArray, logger) ) continue;
          
          String url          = generateURL(x, invitation, business, logger);
          if ( SafetyUtil.equals(url, "") ) continue;

          // SEND EMAIL
          message             = new EmailMessage();
          args                = new HashMap<>();

          message.setTo(new String[]{ invitation.getEmail() });
          args.put("link", url);
          args.put("sendTo", invitation.getEmail());
          args.put("companyname", business.toSummary());  
          try {
            EmailsUtility.sendEmailFromTemplate(x, business, message, "signingOfficerReminder", args);
          } catch (Throwable t) {
            logger.error("@SigningOfficerReminderCron: while sending email for business " + business.getId(), t);
            continue;
          }
        }
        
        `
    },
    {
      name: 'timeIntervalsBasedOnAppMode',
      javaType: 'long[]',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        AppConfig appConfig = (AppConfig) x.get("appConfig");
        if ( appConfig == null ) return null;
        long[] intervalArray = new long[2];
        if ( appConfig.getMode() == Mode.STAGING ) {
          intervalArray[0] = 1000l*24l;
          intervalArray[1] = 1000l*60l;
          return intervalArray;
        }
        intervalArray[0] = 1000l*60l*60l*24l;
        intervalArray[1] = 1000l*60l*60l*24l*7l;
        return intervalArray;
      `
    },
    {
      name: 'determineIfTimeConditionSatified',
      javaType: 'boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'invitation',
          type: 'Invitation'
        },
        {
          name: 'intervalArray',
          javaType: 'long[]'
        },
        {
          name: 'logger',
          type: 'Logger'
        }
      ],
      javaCode: `
      DAO              emailMessageDAO    = (DAO) x.get("emailMessageDAO");
      Long              comparisonTime    = 0l;
      Date                       today    = new Date();
      String[]                 toEmail    = {invitation.getEmail()};

      // LOCATE the last time a reminder email was sent.
      List<EmailMessage> ems = ((ArraySink) emailMessageDAO.where(AND(
          EQ(EmailMessage.SUBJECT, "Invitation from your employee to join Ablii"),
          IN(invitation.getEmail(), EmailMessage.TO)
        )
      ).select(new ArraySink())).getArray();

      try {
        if ( ems.size() == 0 ) {
          // FIRST EMAIL - ONE DAY AFTER
          comparisonTime = invitation.getTimestamp().getTime();
          return ! ( (today.getTime() - comparisonTime) < intervalArray[0] );
        } else if ( ems.size() == 1 ) {
          // SECOND EMAIL - SEVEN DAYS AFTER
          comparisonTime = ems.get(0).getCreated().getTime();
          return ! ( (today.getTime() - comparisonTime) < intervalArray[1] );
        } else if ( ems.size() == 2 ) {
          // THIRD EMAIL - FOURTEEN DAYS AFTER
          comparisonTime = ems.get(0).getCreated().getTime() > ems.get(1).getCreated().getTime() ? 
            ems.get(0).getCreated().getTime() : ems.get(1).getCreated().getTime();
          return ! ( (today.getTime() - comparisonTime) < intervalArray[1] );
        } else { return false; }
      } catch (Exception e) {
        logger.warning("@SigningOfficerReminderCron: while checking time references on business.", e);
        return false;
      }
      `
    },
    {
      name: 'generateURL',
      javaType: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'invitation',
          type: 'Invitation'
        },
        {
          name: 'business',
          type: 'Business'
        },
        {
          name: 'logger',
          type: 'Logger'
        }
      ],
      javaCode: `
        // REGENERATE URL
        String    email       = "";
        Token     token       = null;
        Date      today       = new Date();
        long      oneWeek     = (long)1000*60*60*24*7;
        Date      expiryDate  = new Date(today.getTime() + oneWeek);
        DAO       tokenDAO    = (DAO) x.get("tokenDAO");

        List<Token> tokenList = ((ArraySink) tokenDAO.where(AND(
            EQ(Token.PROCESSED, false),
            GTE(Token.EXPIRY, expiryDate)
          )
        ).select(new ArraySink())).getArray();
        
        for (Token t : tokenList) {
          email = (String)((Map)t.getParameters()).get("inviteeEmail");
          if ( email != null && SafetyUtil.equals(email, invitation.getEmail())) {
            token = t;
            break;
          }
        }

        if ( token == null ) {
          return "";
        }

        Group group         = business.findGroup(x);
        AppConfig appConfig = group.getAppConfig(x);
        String url          = appConfig.getUrl();

        if ( invitation.getInternal() ) {
          return url += "/service/joinBusiness?token=" + token.getData() + "&redirect=/";
        }

        // Encoding business name and email to handle special characters.
        String encodedBusinessName, encodedEmail;
        try {
          encodedEmail =  URLEncoder.encode(invitation.getEmail(), "UTF-8");
          encodedBusinessName = URLEncoder.encode(business.getBusinessName(), "UTF-8");
        } catch(Exception e) {
          logger.error("@SigningOfficerReminderCron: Error encoding the email or business name.", e);
          return "";
        }

        String country = ((foam.nanos.auth.Address)business.getAddress()).getCountryId();

        url += "?token=" + token.getData();
        if ( country != null ) url += "&country=" + country;
        return url += "&email=" + encodedEmail + "&companyName=" + encodedBusinessName + "#sign-up";
      `
    }
  ]
});
