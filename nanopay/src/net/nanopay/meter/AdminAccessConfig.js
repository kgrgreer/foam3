foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'AdminAccessConfig',

  properties: [
    {
      class: 'List',
      name: 'adminUserIds',
      documentation: 'List of user ids that will keep admin access.',
      javaType: 'java.util.ArrayList<java.lang.Long>',
      view: {
        class: 'foam.u2.view.ReferenceArrayView',
        daoKey: 'userDAO'
      }
    },
    {
      class: 'String',
      name: 'opSupportGroup',
      value: 'operations-support',
      documentation: `All users not in adminUsers array with admin 
                      access will be moved to this group.`
    }
  ]
});
