foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessCreatedRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.HashMap',
    'java.util.Map',
    'javax.security.auth.AuthPermission',
    'net.nanopay.model.Business',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
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
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
          DAO groupDAO = (DAO) x.get("groupDAO");
          
          Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexBusiness.getUser())); 
          if ( null != business ) {
            Address businessAddress = business.getBusinessAddress();
            if ( null != businessAddress && null != businessAddress.getCountryId() ) {
              String permissionString = "currency.read.";
              permissionString = businessAddress.getCountryId().equals("CA") ? permissionString + "USD" : permissionString + "CAD";
              Permission permission = new Permission.Builder(x).setId(permissionString).build();
              Group group = business.findGroup(x);
              if ( null != group && ! group.implies(x, new AuthPermission(permissionString)) ) {
                try {
                  group.getPermissions(x).add(permission);  
                  // Send Notifications
                  sendOperationsNotification(x, business);
                  sendUserNotification(x, business);
                } catch(Throwable t) {
                    logger.error("Error applying AFEXBusinessComplianceTransactionRule.", t);
                  }
                } 
              }
            }
        }

      }, "AFEX Business Compliance");
      `
    },
    {
      name: 'sendOperationsNotification',
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
      EmailMessage message = new EmailMessage();
      Map<String, Object>  args = new HashMap<>();
      args.put("subTitle1", "User(Account Owner) information: AFEX Business CREATED");
      args.put("userId", business.getId());
      args.put("userEmail", business.getEmail());
      args.put("userCo", business.getOrganization());
      
      try {
        EmailsUtility.sendEmailFromTemplate(x, business, message, "afex-business-created-notification", args);
      } catch (Throwable t) {
        String msg = String.format("Email meant for operations team Error: User (id = %1$s) has been onboarded to AFEX.", business.getId());
        ((Logger) x.get("logger")).error(msg, t);
      }
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
      EmailMessage         message = new EmailMessage();
      Map<String, Object>  args = new HashMap<>();
      Group                group = (Group) business.findGroup(x);
      AppConfig            appConfig    = group.getAppConfig(x);
      String               url = appConfig.getUrl().replaceAll("/$", "");

      message.setTo(new String[]{business.getEmail()});
      String toCountry = business.getBusinessAddress().getCountryId().equals("CA") ? "USA" : "Canada";
      String toCurrency = business.getBusinessAddress().getCountryId().equals("CA") ? "USD" : "CAD";
      args.put("business", business.getBusinessName());
      args.put("toCurrency", toCurrency);
      args.put("toCountry", toCountry); 
      args.put("link",   url + "#sme.main.dashboard");     
      try {
        EmailsUtility.sendEmailFromTemplate(x, business, message, "international-payments-enabled-notification", args);
      } catch (Throwable t) {
        String msg = String.format("Email meant for business Error: User (id = %1$s) has been enabled for international payments.", business.getId());
        ((Logger) x.get("logger")).error(msg, t);
      }
      `
    }
  ]

});
