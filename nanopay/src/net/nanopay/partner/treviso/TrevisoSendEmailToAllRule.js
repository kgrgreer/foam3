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
          String soCapId = "crunch.onboarding.signing-officer-information";

          // find all signingofficers of the business and send email to signing officers whose hasSignedContratosDeCambio is true
          List<UserCapabilityJunction> sopJunctions = ((ArraySink) userCapabilityJunctionDAO.where(AND(
              EQ(AgentCapabilityJunction.EFFECTIVE_USER, business.getId()),
              EQ(UserCapabilityJunction.TARGET_ID, soCapId),
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
            ))
            .select(new ArraySink()))
            .getArray();
          for ( UserCapabilityJunction sopJunction : sopJunctions ) {
            User so = sopJunction.findSourceId(x);
            sendNotificationToUser(x, business, so);
          }
        }
      }, "When the business account is approved, send emails to signing officers.");
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
    }
  ]
});
