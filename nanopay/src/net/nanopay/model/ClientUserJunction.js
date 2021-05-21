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
      class: 'Long',
      name: 'sourceId'
    },
    {
      class: 'Long',
      name: 'targetId'
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
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.UserUserJunction',
      name: 'agentJunctionObj'
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
      of: 'foam.nanos.auth.AgentJunctionStatus',
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
