foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXAddCurrencyPermissionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Adds currency.read.FX_CURRENCY permissions to a business when AFEXBUsiness is created.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map',
    'javax.security.auth.AuthPermission',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
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

          if ( ! (obj instanceof AFEXBusiness) ) {
            return;
          }

          AFEXBusiness afexBusiness = (AFEXBusiness) obj;
          DAO dao = ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, "afexBusinessDAO"),
            EQ(ApprovalRequest.OBJ_ID, afexBusiness.getId())
          ));

          ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
          if ( approval == ApprovalStatus.APPROVED ) {
            DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
            DAO localGroupDAO = (DAO) x.get("localGroupDAO");

            Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexBusiness.getUser()));
            if ( null != business ) {
              Address businessAddress = business.getAddress();
              if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {
                String permissionString = "currency.read.";
                permissionString = businessAddress.getCountryId().equals("CA") ? permissionString + "USD" : permissionString + "CAD";
                Permission permission = new Permission.Builder(x).setId(permissionString).build();
                Group group = (Group) localGroupDAO.find(business.getGroup());
                while ( group != null ) {
                  group = (Group) group.findParent(x);
                  if ( group != null && group.getId().endsWith("employee") ) break;
                }
                if ( null != group && ! group.implies(x, new AuthPermission(permissionString)) ) {
                  try {
                    group.getPermissions(x).add(permission);
                    sendUserNotification(x, business);

                    // add permission for USBankAccount strategizer
                    if ( null != group && ! group.implies(x, new AuthPermission("strategyreference.read.9319664b-aa92-5aac-ae77-98daca6d754d")) ) {
                      permission = new Permission.Builder(x).setId("strategyreference.read.9319664b-aa92-5aac-ae77-98daca6d754d").build();
                      group.getPermissions(x).add(permission);
                    }

                  } catch(Throwable t) {
                    logger.error("Error adding " + permissionString + " to business " + business.getId(), t);
                  }
                }
              }
            }
          }

        }

      }, "Adds currency.read.FX_CURRENCY permissions to business when AFEXBUsiness is created.");
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
        DAO                  localGroupDAO  = (DAO) x.get("localGroupDAO");
        Group                group          = business.findGroup(x);
        AppConfig            appConfig      = group.getAppConfig(x);
        String               url            = appConfig.getUrl().replaceAll("/$", "");

        String toCountry = business.getAddress().getCountryId().equals("CA") ? "USA" : "Canada";
        String toCurrency = business.getAddress().getCountryId().equals("CA") ? "USD" : "CAD";
        args.put("business", business.getBusinessName());
        args.put("toCurrency", toCurrency);
        args.put("toCountry", toCountry);
        args.put("link",   url + "#sme.main.dashboard");
        args.put("sendTo", User.EMAIL);
        args.put("name", User.FIRST_NAME);

        try {

          Notification internationalPaymentsEnabledNotification = new Notification.Builder(x)
            .setBody("AFEX Business can make international payments.")
            .setNotificationType("AFEXBusinessInternationalPaymentsEnabled")
            .setGroupId(group.toString())
            .setEmailIsEnabled(true)
            .setEmailArgs(args)
            .setEmailName("international-payments-enabled-notification")
            .build();

          business.doNotify(x, internationalPaymentsEnabledNotification);

        } catch (Throwable t) {
          String msg = String.format("Email meant for business Error: User (id = %1$s) has been enabled for international payments.", business.getId());
          ((Logger) x.get("logger")).error(msg, t);
        }
      `
    }
  ]

});
