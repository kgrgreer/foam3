foam.CLASS({
  package: 'net.nanopay.model',
  name: 'ClientUserJunction',
  documentation: `
    Model used to represent UserUserJunction objects on the GUI.
    Represents a user and it's access to another user.
  `,

  tableColumns: ['name', 'title', 'email', 'accessGroup', 'status'],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name: 'group'
    },
    {
      class: 'String',
      name: 'accessControl',
      documentation: 'Derive the appropriate access group from the group name.',
      expression: function(group) {
        return group.replace(group.substring(0, group.indexOf('.') + 1), '');
      }
    },
    {
      class: 'String',
      name: 'status',
      value: 'Active'
    }
  ]
});
