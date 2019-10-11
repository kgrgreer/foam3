foam.CLASS({
    package: 'net.nanopay.invoice.ruler',
    name: 'RequestPaymentNotificationRule',
  
    documentation: 'An action that sends a notification to both sender and receiver of request payment invoice',
  
    implements: ['foam.nanos.ruler.RuleAction'],
  
    javaImports: [
      'foam.core.FObject',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.auth.User',
      'foam.nanos.logger.Logger',
      'foam.core.ContextAgent',
      'foam.nanos.notification.Notification',
      'foam.util.SafetyUtil',
      'net.nanopay.invoice.model.Invoice',
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
           agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {

              }
           },"send a Ablii Completed notification");
        `
      }
    ]
  });