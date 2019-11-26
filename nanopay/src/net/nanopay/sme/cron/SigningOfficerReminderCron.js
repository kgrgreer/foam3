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
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
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
  Incremental times are 1 day, 1 week, and 2 weeks of inactivity`,

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
        Date                       today    = new Date();
        Long              comparisonTime    = 0l;
        Logger                    logger    = (Logger) x.get("logger");
        DAO                  businessDAO    = (DAO) x.get("businessDAO");
        DAO              emailMessageDAO    = (DAO) x.get("emailMessageDAO");
        DAO        businessInvitationDAO    = (DAO) x.get("businessInvitationDAO");
        int[]              intervalArray    = distinguishTimeIntervals(x);
        if ( intervalArray == null ) logger.error("@SigningOfficerReminderCron and no appConfig found :S ");
        
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
                EQ(Invitation.GROUP, "admin"),
                EQ(Invitation.CREATED_BY, business.getId()),
                EQ(Invitation.STATUS, InvitationStatus.SENT)
              )
            );

          if ( invitation == null ) continue;

          // LOCATE the last time a reminder email was sent.
          List<EmailMessage> ems = ((ArraySink) emailMessageDAO
            .where(
              AND(
                EQ(EmailMessage.SUBJECT, "Invitation from your employee to join Ablii"),
                EQ(EmailMessage.TO, invitation.getEmail())
              )
            ).select(new ArraySink())).getArray();
          
          // DETERMINE if one of the time conditions are satified
          try {
            if ( ems.size() == 0 ) {
              // FIRST EMAIL - ONE DAY AFTER
              comparisonTime = invitation.getTimestamp().getTime();
              if ( (today.getTime() - comparisonTime) < intervalArray[0] ) continue;
            } else if ( ems.size() == 1 ) {
              // SECOND EMAIL - SEVEN DAYS AFTER
              comparisonTime = ems.get(0).getCreated().getTime();
              if ( (today.getTime() - comparisonTime) < intervalArray[1] ) continue;
            } else if ( ems.size() == 2 ) {
              // THIRD EMAIL - FOURTEEN DAYS AFTER
              comparisonTime = ems.get(0).getCreated().getTime() > ems.get(1).getCreated().getTime() ? 
                ems.get(0).getCreated().getTime() : ems.get(1).getCreated().getTime();
              if ( (today.getTime() - comparisonTime) < intervalArray[1] ) continue;
            } else { continue; }
          } catch (Exception e) {
            logger.error("@SigningOfficerReminderCron: while checking time references on businsess " + business.getId(), e);
          }
          
          // SEND EMAIL
          message             = new EmailMessage();
          args                = new HashMap<>();
          Group group         = business.findGroup(x);
          AppConfig appConfig = group.getAppConfig(x);
          String url          = appConfig.getUrl().replaceAll("/$", "");

          message.setTo(new String[]{ invitation.getEmail() });
          args.put("link", url);
          args.put("sendTo", invitation.getEmail());
          args.put("companyname", business.label());  
          try {
            EmailsUtility.sendEmailFromTemplate(x, business, message, "signingOfficerReminder", args);
          } catch (Throwable t) {
            logger.error("@SigningOfficerReminderCron: while sending email for businsess" + business.getId(), t);
          }
        }
        
        `
    },
    {
      name: 'distinguishTimeIntervals',
      javaType: 'int[]',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        AppConfig appConfig = (AppConfig) x.get("appConfig");
        if ( appConfig == null ) return null;
        int[] intervalArray = new int[2];
        if ( appConfig.getMode() == Mode.STAGING ) {
          intervalArray[0] = (1000*24);
          intervalArray[1] = (1000*60);
        }
        intervalArray[0] = (1000*60*60*24);
        intervalArray[1] = (1000*60*60*24*7);
        return intervalArray;
      `
    }
  ]
});

