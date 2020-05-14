foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquidNotification',
  extends: 'foam.nanos.notification.Notification',
  implements: [
    'foam.nanos.auth.CreatedByAware'
  ],

  documentation: 'Liquid specific notification model.',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User that initiated the notification.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'action',
      documentation: 'Action that was performed.'
    },
    {
      class: 'String',
      name: 'entity',
      documentation: 'Entity that was acted upon.'
    },
    {
      class: 'String',
      name: 'initiationDescription',
      documentation: 'Description of the action that took place and by whom',
      expression: (createdBy, action, entity) => {
        this.__subContext__.userDAO.find(createdBy)
          .then((user) => {
            return user.getFirstName() + ' ' + user.getLastName() + action + ' a ' + entity.toLowerCase();
          });
      },
      transient: true
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Truncated summary description.'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.approval.ApprovalStatus',
      name: 'approvalStatus',
      documentation: 'Enum representing approval status.'
    }
  ]
});
