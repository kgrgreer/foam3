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
  name: 'AFEXBusinessCreatedNotificationRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Sends Operations email notification when AFEXBUsiness is created.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.HashMap',
    'java.util.Map',
    'net.nanopay.model.Business',
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
          
          if ( ! (obj instanceof AFEXUser) ) {
            return;
          }
          
          AFEXUser afexUser = (AFEXUser) obj;
          DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");          
          Business business = (Business) localBusinessDAO.find(EQ(Business.ID, afexUser.getUser()));
          if ( null != business ) {
            sendOperationsNotification(x, business);
          }
        }

      }, "Sends Operations email notification when AFEXBUsiness is created.");
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
  ]

});
