foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXCoridorEnabledNotificationRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.EQ'

  ],

  documentation: `Sends Business email notification when AFEXBUsiness is created and corridor is enabled.`,

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
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");

          Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexBusiness.getUser()));
          if ( null != business ) {
            Address businessAddress = business.getAddress();
            if ( null != businessAddress && ! SafetyUtil.isEmpty(businessAddress.getCountryId()) ) {
              sendUserNotification(x, business);
            }
          }
        }

      }, "Sends Business email notification when AFEXBUsiness is created and corridor is enabled.");
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
      EmailMessage         message        = new EmailMessage();
      Map<String, Object>  args           = new HashMap<>();
      DAO                  localGroupDAO  = (DAO) x.get("localGroupDAO");
      Group                group          = (Group) localGroupDAO.find(business.getGroup());
      AppConfig            appConfig      = group.getAppConfig(x);
      String               url            = appConfig.getUrl().replaceAll("/$", "");

      message.setTo(new String[]{business.getEmail()});
      String toCountry = business.getAddress().getCountryId().equals("CA") ? "USA" : "Canada";
      String toCurrency = business.getAddress().getCountryId().equals("CA") ? "USD" : "CAD";
      args.put("business", business.getBusinessName());
      args.put("toCurrency", toCurrency);
      args.put("toCountry", toCountry);
      args.put("link",   url + "#sme.main.dashboard");
      try {
        Notification internationalPaymentsEnabledNotification = new Notification.Builder(x)
          .setBody("AFEX Business has been created and corridor has been enabled.")
          .setNotificationType("AFEXBusinessCreatedCorridorEnabled")
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
