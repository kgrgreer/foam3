foam.CLASS({
  package: 'net.nanopay.sme',
  name: 'OnboardingPaymentOpsNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'String',
      name: 'groupId',
      value: 'payment-ops',
      javaValue: '"payment-ops"'
    },
    ['emailIsEnabled', true],
    ['emailName', 'user-signup'],
    ['notificationType', 'UserSignup'],
    {
      name: 'body',
      expression: function() {
        return `A new user has been add to the platform.\n userId:${userId}\n userEmail: ${userEmail}`;
      }
    },
  ]
});

