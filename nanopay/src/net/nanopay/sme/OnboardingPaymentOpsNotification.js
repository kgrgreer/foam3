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
    ['emailName', 'failed-sdd'],
    ['notificationType', 'FailedTransactions'],
    {
      name: 'body',
      expression: function() {
        return `User UserID has been add to the platform.`;
      }
    }
  ]
});

