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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXPayableMenuCapabilityRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Grants AFEX Payable Menu Capability after Afex business is created and approved.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map',
    'javax.security.auth.AuthPermission',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'

  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          var crunchService = (CrunchService) x.get("crunchService");
          Logger logger = (Logger) x.get("logger");

          if ( ! (obj instanceof AFEXBusinessApprovalRequest) ) {
            return;
          }

          AFEXBusinessApprovalRequest request = (AFEXBusinessApprovalRequest) obj.fclone();
          AFEXBusiness afexBusiness = (AFEXBusiness) ((DAO) x.get("afexBusinessDAO")).find(EQ(AFEXBusiness.ID, request.getObjId()));
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          DAO localGroupDAO = (DAO) x.get("localGroupDAO");

          Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexBusiness.getUser()));
          if ( null != business ) {
            Address businessAddress = business.getAddress();
            if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {

              var subject = new Subject(x);
              subject.setUser(business);
              subject.setUser(business);

              var subjectX = x.put("subject", subject);

              DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
              String afexPaymentMenuCapId = "1f6b2047-1eef-471d-82e7-d86bdf511375";
              crunchService.updateJunction(subjectX, afexPaymentMenuCapId, null, CapabilityJunctionStatus.GRANTED);

              // Temporary pending when MinMax Cap is fixed
              crunchService.updateJunction(subjectX, "554af38a-8225-87c8-dfdf-eeb15f71215f-20", null, CapabilityJunctionStatus.GRANTED);

              sendUserNotification(x, business);
            }
          }
        }

      }, "Grants AFEX Payable Meny Capability after Afex  business is created and approved.");
      `
    },
    {
      name: 'sendUserNotification',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'business',
          type: 'net.nanopay.model.Business'
        }
      ],
      javaCode:`
        Map<String, Object>  args           = new HashMap<>();
        Group                group          = business.findGroup(x);
        AppConfig            config         = group != null ? group.getAppConfig(x) : (AppConfig) x.get("appConfig");

        String toCountry = business.getAddress().findCountryId(x).getName();
        args.put("business", business.toSummary());
        args.put("toCountry", toCountry);
        args.put("link",   config.getUrl() + "#capability.main.dashboard");
        args.put("sendTo", User.EMAIL);
        args.put("name", User.FIRST_NAME);

        try {

          if ( group == null ) throw new RuntimeException("Group is null");

          Notification notification = business.getAddress().getCountryId().equals("CA") ?
            new Notification.Builder(x)
              .setBody("AFEX Business can make international payments.")
              .setNotificationType("AFEXBusinessInternationalPaymentsEnabled")
              .setGroupId(group.toString())
              .setEmailArgs(args)
              .setEmailName("international-payments-enabled-notification")
              .build() :
            new Notification.Builder(x)
              .setBody("This business can now make international payments")
              .setNotificationType("Latest_Activity")
              .setGroupId(group.toString())
              .setEmailArgs(args)
              .setEmailName("compliance-notification-to-user")
              .build();

          business.doNotify(x, notification);

        } catch (Throwable t) {
          String msg = String.format("Email meant for business Error: User (id = %1$s) has been enabled for international payments.", business.getId());
          ((Logger) x.get("logger")).error(msg, t);
        }
      `
    }
  ]

});
