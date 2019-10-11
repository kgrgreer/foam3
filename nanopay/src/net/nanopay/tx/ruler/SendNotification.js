foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'SendNotification',

  documentation: 'An action that just puts a notification',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.core.ContextAgent',
    'foam.nanos.notification.Notification',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.notification.Notification',
      name: 'notification'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              DAO notificationDAO = (DAO) x.get("localNotificationDAO");
              if ( getNotification() != null && notificationDAO != null ) {
                try {
                  notificationDAO.put(getNotification());
                }
                catch (Exception E) {
                  Logger logger = (Logger) x.get("logger");
                  logger.error("Failed to put notification: "+E);
                };
              }
            }
         },"send a notification");
      `
    }
  ]
});
