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

              DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
              String afexPaymentMenuCapId = "1f6b2047-1eef-471d-82e7-d86bdf511375";
              UserCapabilityJunction ucj = (UserCapabilityJunction) ucjDAO.find(AND(
                EQ(UserCapabilityJunction.TARGET_ID, afexPaymentMenuCapId),
                EQ(UserCapabilityJunction.SOURCE_ID, business.getId())
              ));
              if ( ucj == null ) {
                ucj = new UserCapabilityJunction.Builder(x).setSourceId(business.getId())
                  .setTargetId(afexPaymentMenuCapId)
                  .build();
              }
              ucj.setStatus(CapabilityJunctionStatus.GRANTED);
              ucjDAO.put(ucj);

              // Temporary pending when MinMax Cap is fixed
              UserCapabilityJunction ucj2 = (UserCapabilityJunction) ucjDAO.find(AND(
                EQ(UserCapabilityJunction.TARGET_ID, "554af38a-8225-87c8-dfdf-eeb15f71215f-20"),
                EQ(UserCapabilityJunction.SOURCE_ID, business.getId())
              ));
              ucj2.setStatus(CapabilityJunctionStatus.GRANTED);
              ucjDAO.put(ucj2);

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
          
          Themes themes = (Themes) x.get("themes");
          Theme theme = themes.findThemeBySpid(((X) x.put("subject", new Subject.Builder(x).setUser(business).build())));
          X notificationX = theme != null ? (X) x.put("theme", theme) : x;
          business.doNotify(notificationX, notification);

        } catch (Throwable t) {
          String msg = String.format("Email meant for business Error: User (id = %1$s) has been enabled for international payments.", business.getId());
          ((Logger) x.get("logger")).error(msg, t);
        }
      `
    }
  ]

});
