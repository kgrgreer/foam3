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
  package: 'net.nanopay.partner.treviso',
  name: 'TrevisoSendEmailToAllRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: ``,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.HashMap',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.Map',
    'net.nanopay.model.Business',
    'net.nanopay.partner.treviso.onboarding.BRBeneficialOwner',
    'net.nanopay.partner.treviso.onboarding.BRBusinessDirector',
    'net.nanopay.partner.treviso.onboarding.BRBusinessOwnershipData',
    'net.nanopay.partner.treviso.onboarding.BusinessDirectorsData',
    'net.nanopay.partner.treviso.TrevisoSendEmailToAllNotification',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO localUserDAO = (DAO) x.get("localuserDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
          UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
          Business business = (Business) ucj.findSourceId(x);
          List<String> uniqueEmails = new ArrayList<String>();
          String soCapId = "crunch.onboarding.signing-officer-information";
          String ownerCapId = "554af38a-8225-87c8-dfdf-eeb15f71215f-7-br";
          String directorCapId = "crunch.onboarding.business-directors";

          // find all signingofficers of the business and send email to signing officers whose hasSignedContratosDeCambio is true
          List<UserCapabilityJunction> sopJunctions = ((ArraySink) userCapabilityJunctionDAO.where(AND(
              EQ(AgentCapabilityJunction.EFFECTIVE_USER, business.getId()),
              EQ(UserCapabilityJunction.TARGET_ID, soCapId),
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
            ))
            .select(new ArraySink()))
            .getArray();
          for ( UserCapabilityJunction sopJunction : sopJunctions ) {
            SigningOfficerPersonalDataTreviso soData = (SigningOfficerPersonalDataTreviso) sopJunction.getData();
            User so = sopJunction.findSourceId(x);
            uniqueEmails.add(so.getEmail());
            if ( soData.getHasSignedContratosDeCambio() ) sendNotificationToUser(x, business, so);
          }

          // send email to beneficial owners whose hasSignedContratosDeCambio is true
          UserCapabilityJunction ownerUCJ = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
            EQ(UserCapabilityJunction.SOURCE_ID, business.getId()),
            EQ(UserCapabilityJunction.TARGET_ID, ownerCapId),
            EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
          ));
          BRBusinessOwnershipData ownerData = (BRBusinessOwnershipData) ownerUCJ.getData();
          for ( BRBeneficialOwner beneficialOwnerUser : ownerData.getOwners() ) {
            if ( hasAlreadyBeenEmailed(uniqueEmails, beneficialOwnerUser.getEmail()) ) continue;
            else uniqueEmails.add(beneficialOwnerUser.getEmail());
            if ( beneficialOwnerUser.getHasSignedContratosDeCambio() ){
              sendEmailToNonUser(x, business, beneficialOwnerUser.getFirstName(), beneficialOwnerUser.getEmail());
            }
          }

          // send email to business directors whose hasSignedContratosDeCambio is true
          UserCapabilityJunction directorUCJ = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
            EQ(UserCapabilityJunction.SOURCE_ID, business.getId()),
            EQ(UserCapabilityJunction.TARGET_ID, directorCapId),
            EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
          ));
          BusinessDirectorsData directorData = (BusinessDirectorsData) directorUCJ.getData();
          BRBusinessDirector[] directorList = (BRBusinessDirector[]) directorData.getBusinessDirectors();
          for ( int i = 0; i < directorList.length; i++ ) {
            BRBusinessDirector directorUser = (BRBusinessDirector) directorList[i];
            if ( hasAlreadyBeenEmailed(uniqueEmails, directorUser.getEmail()) ) continue;
            else uniqueEmails.add(directorUser.getEmail());
            if ( directorUser.getHasSignedContratosDeCambioDirector() ){
              sendEmailToNonUser(x, business, directorUser.getFirstName(), directorUser.getEmail());
            }
          }
        }
      }, "When the business account is approved, send emails to all directors, signing officers who have signed contratos de câmbio.");
      `
    },
    {
      name: 'hasAlreadyBeenEmailed',
      args: [
        {
          name: 'uniqueEmails',
          type: 'List'
        },
        {
          name: 'userEmail',
          type: 'String'
        }
      ],
      description: `function checks if a user has already been emailed, if so it doesn't email the person again.`,
      type: 'Boolean',
      javaCode: `
        for( Object email : uniqueEmails ) {
          if ( email.toString().equals(userEmail) ) return true;
        }
        return false;
      `
    },
    {
      name: 'sendNotificationToUser',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'business',
          type: 'net.nanopay.model.Business'
        },
        {
          name: 'recipient',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        Map<String, Object>  args           = new HashMap<>();
        Group                group          = business.findGroup(x);
        AppConfig            config         = group != null ? group.getAppConfig(x) : (AppConfig) x.get("appConfig");

        String toCountry = business.getAddress().findCountryId(x).getName();
        args.put("business", business.toSummary());
        args.put("toCountry", toCountry);
        args.put("link", config.getUrl());
        args.put("sendTo", recipient.getEmail());
        args.put("name", recipient.getFirstName());

        try {
          TrevisoSendEmailToAllNotification notification = new TrevisoSendEmailToAllNotification.Builder(x)
            .setSummary(business.toSummary())
            .setNotificationType("Latest_Activity")
            .setUserId(recipient.getId())
            .setEmailArgs(args)
            .setEmailName("compliance-notification-to-user")
            .build();
          recipient.doNotify(x, notification);
        } catch (Throwable t) {
          String msg = String.format("Email meant for business Error: Business (id = %1$s) has been enabled for international payments.", business.getId());
          ((Logger) x.get("logger")).error(msg, t);
        }
      `
    },
    {
      name: 'sendEmailToNonUser',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'business',
          type: 'net.nanopay.model.Business'
        },
        {
          name: 'firstName',
          type: 'String'
        },
        {
          name: 'email',
          type: 'String'
        }
      ],
      javaCode: `
        Map<String, Object>  args           = new HashMap<>();
        Group                group          = business.findGroup(x);
        AppConfig            config         = group != null ? group.getAppConfig(x) : (AppConfig) x.get("appConfig");

        String toCountry = business.getAddress().findCountryId(x).getName();
        args.put("business", business.toSummary());
        args.put("toCountry", toCountry);
        args.put("link", config.getUrl());
        args.put("sendTo", email);
        args.put("name", firstName);

        EmailMessage message = new EmailMessage();
        message.setTo(new String[]{email});

        try {
          EmailsUtility.sendEmailFromTemplate(x, business, message, "compliance-notification-to-non-user", args);
        } catch (Throwable t) {
          String msg = String.format("Email meant for business Error: Business (id = %1$s) has been enabled for international payments.", business.getId());
          ((Logger) x.get("logger")).error(msg, t);
        }
      `
    }
  ]
});
