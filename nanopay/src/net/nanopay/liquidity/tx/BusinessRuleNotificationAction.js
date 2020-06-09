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
      value: 'liquidBasic'
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
