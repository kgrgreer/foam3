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
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'NotifyIdentityMindResponseError',

  documentation: 'Sends notification on IdentityMind error response.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'groupId'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            IdentityMindResponse response = (IdentityMindResponse) obj;
            Notification notification = new Notification.Builder(x)
              .setNotificationType("IdentityMind Errors")
              .setGroupId(getGroupId())
              .setBody(String.format("[%d %s] IdentityMindResponse (id:%d, entityType:%s, entityId:%s).",
                response.getStatusCode(),
                response.getError_message(),
                response.getId(),
                response.getEntityType(),
                response.getEntityId()))
              .build();
            ((DAO) x.get("localNotificationDAO")).put(notification);
          }
        }, "Notify IdentityMind error response");
      `
    }
  ]
});
