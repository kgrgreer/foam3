/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history',
  name: 'HistoryRecord',

  documentation: 'Contains an array of property updates',
  ids: [ 'objectId', 'seqNo' ],

  tableColumns: [
    'timestamp',
    'objectId',
    'user',
    'updates'
  ],

  properties: [
    {
      class: 'Long',
      name: 'seqNo',
      hidden: true
    },
    {
      class: 'Object',
      name: 'objectId',
      label: 'Updated Object',
      documentation: 'Id of object related to history record.',
      visibility: 'RO',
      tableWidth: 150,
      tableCellFormatter: function(value, _) {
        if ( !value ) return;
        this.add(!!value.toSummary ? value.toSummary() : value);
      },
      javaCompare: `
      if ( o1 != null && o2 != null ) {
        return o1.toString().compareTo(o2.toString());
      }
      if ( o1 == null && o2 == null) return 0;
      return o1 == null ? -1 : 1;
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'subject',
      documentation: `References subject that made update. TODO: remove references when subject becomes serializable`,
      visibility: 'RO',
      postSet: function(o, n) {
        this.userId = n.user.id;
        this.agentId = n.realUser.id;
        this.user = n.user.toSummary();
        this.agent= n.realUser.toSummary();
      },
      javaSetter: `
        foam.nanos.auth.User user = (foam.nanos.auth.User) val.getUser();
        foam.nanos.auth.User agent = (foam.nanos.auth.User) val.getRealUser();
        setUserId(user.getId());
        setUser(user.toSummary());
        setAgentId(agent.getId());
        setAgent(agent.toSummary());
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'agentId',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'user',
      label: 'Updated By',
      documentation: 'User that made the update.',
      visibility: 'RO',
      tableWidth: 200
    },
    {
      class: 'String',
      name: 'agent',
      label: 'Updated By',
      documentation: 'Agent that made the update',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'timestamp',
      documentation: 'Date and time history record was created.',
      visibility: 'RO',
      tableWidth: 200
    },
    {
      class: 'FObjectArray',
      of: 'foam.dao.history.PropertyUpdate',
      name: 'updates',
      label: 'Updated Properties',
      documentation: 'Properties updated, contains new and old values.',
      visibility: 'RO'
    }
  ]
});
