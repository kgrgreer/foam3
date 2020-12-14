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
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.Notification',
    'foam.util.Emails.EmailsUtility',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessDirector',
    'net.nanopay.model.BusinessUserJunction',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO localUserDAO = (DAO) x.get("localUserDAO");
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
          Business business = (Business) localBusinessDAO.find(EQ(Business.ID, ucj.getSourceId()));
          User user = ((Subject) x.get("subject")).getUser();
          
          // send email to signing officers whose hasSignedContratosDeCambio is true
          DAO signingOfficerJunctionDAO = (DAO) x.get("signingOfficerJunctionDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
          List<BusinessUserJunction> soJunctions = ((ArraySink) signingOfficerJunctionDAO
            .where(EQ(BusinessUserJunction.SOURCE_ID, business.getId()))
            .select(new ArraySink()))
            .getArray();

          if ( soJunctions == null || soJunctions.size() == 0 ) {
            throw new RuntimeException("Signing officers not found");
          }

          for ( BusinessUserJunction soJunction : soJunctions ){
            UserCapabilityJunction soCapJunc = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
              EQ(UserCapabilityJunction.SOURCE_ID, soJunction.getTargetId()),
              EQ(UserCapabilityJunction.TARGET_ID, "777af38a-8225-87c8-dfdf-eeb15f71215f-123")
            ));
            SigningOfficerPersonalDataTreviso soData = (SigningOfficerPersonalDataTreviso) soCapJunc.getData();
            User signingOfficer = (User) localUserDAO.find(soJunction.getTargetId());

            if ( soData.getHasSignedContratosDeCambio() ) sendNotificationToUser(x, business, signingOfficer);
          }

          // send email to beneficial owners whose hasSignedContratosDeCambio is true
          List<BeneficialOwner> beneficialOwners = ((ArraySink) business.getBeneficialOwners(x)
            .where(EQ(BeneficialOwner.HAS_SIGNED_CONTRATOS_DE_CAMBIO, true))
            .select(new ArraySink()))
            .getArray();

          for ( BeneficialOwner beneficialOwner : beneficialOwners ) {
            List<User> beneficialOwnerUser = ((ArraySink) localUserDAO
              .where(EQ(User.EMAIL, beneficialOwner.getEmail()))
              .select(new ArraySink()))
              .getArray();
            if ( beneficialOwnerUser.isEmpty() ){
              sendEmailToNonUser(x, business, beneficialOwner.getFirstName(), beneficialOwner.getEmail());
            } else {
              sendNotificationToUser(x, business, beneficialOwnerUser.get(0));
            }
          }

          // send email to business directors whose hasSignedContratosDeCambio is true
          for ( BusinessDirector businessDirector : business.getBusinessDirectors() ) {
            if ( ! businessDirector.getHasSignedContratosDeCambio() ) continue;
            List<User> businessDirectorUser = ((ArraySink) localUserDAO
              .where(EQ(User.EMAIL, businessDirector.getEmail()))
              .select(new ArraySink()))
              .getArray();
            if ( businessDirectorUser.isEmpty() ){
              sendEmailToNonUser(x, business, businessDirector.getFirstName(), businessDirector.getEmail());
            } else {
              sendNotificationToUser(x, business, businessDirectorUser.get(0));
            }
          }
        }
      }, "When the business account is approved, send emails to all directors, signing officers who have signed contratos de câmbio.");
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
        },        
      ],
      javaCode:`
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
          Notification notification = new Notification.Builder(x)
            .setBody(business.toSummary() + " can now make international payments")
            .setNotificationType("Latest_Activity")
            .setUserId(recipient.getId())
            .setEmailArgs(args)
            .setEmailName("compliance-notification-to-user")
            .build();  
          business.doNotify(x, notification);
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
      javaCode:`
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
          EmailsUtility.sendEmailFromTemplate(x, business, message, "compliance-notification-to-user", args);
        } catch (Throwable t) {
          String msg = String.format("Email meant for business Error: Business (id = %1$s) has been enabled for international payments.", business.getId());
          ((Logger) x.get("logger")).error(msg, t);
        }
      `
    }
  ]
});
