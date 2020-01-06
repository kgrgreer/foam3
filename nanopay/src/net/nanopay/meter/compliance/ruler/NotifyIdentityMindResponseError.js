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
              .setEmailIsEnabled(true)
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
