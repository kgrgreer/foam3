foam.CLASS({
  package: 'net.nanopay.model',
  name: 'ClientUserJunction',
  documentation: `
    Model used to represent UserUserJunction objects on the GUI.
    Represents a user and it's access to another user.
  `,

  tableColumns: ['name', 'email', 'accessControl', 'status'],

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
        var accessControl = group.replace(group.substring(0, group.indexOf('.') + 1), '');
        return accessControl.charAt(0).toUpperCase() + accessControl.slice(1);
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.auth.AgentJunctionStatus',
      name: 'status',
      tableCellFormatter: function(state, obj) {
        this.start()
          .start().addClass('user-status-circle-' + state.label).end()
          .start().addClass('user-status-' + state.label)
            .add(state.label)
          .end()
        .end();
      }
    }
  ]
});
