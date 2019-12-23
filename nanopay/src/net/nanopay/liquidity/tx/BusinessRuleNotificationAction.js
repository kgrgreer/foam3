/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'BusinessRuleNotificationAction',

  documentation: 'An action that sends a notification for a business rule.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'businessRuleId',
      class: 'String'
    },
    {
      name: 'groupId',
      class: 'String',
      value: 'liquidDev'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              Transaction tx = (Transaction) obj;
              DAO localUserDAO = (DAO) x.get("localUserDAO");
              DAO notificationDAO = (DAO) x.get("localNotificationDAO");
              Logger logger = (Logger) x.get("logger");

              StringBuilder sb = new StringBuilder("Transaction Alert for Business Rule ")
                .append(getBusinessRuleId())
                .append(" on transaction ")
                .append(tx)
                .append(".");
              String notificationMsg = sb.toString();

              // notification
              Notification notification = new Notification();
              notification.setEmailIsEnabled(true);
              notification.setGroupId(getGroupId());
              notification.setBody(notificationMsg);
              notification.setNotificationType("Business Rule Transaction Alert");
              try {
                notificationDAO.put_(x, notification);
              }
              catch (Exception e) {
                logger.error("Failed to put Business Rule notification. " + e); 
              };
            }
         },"Send a Business Rule Transaction notification");
      `
    }
  ]
});
