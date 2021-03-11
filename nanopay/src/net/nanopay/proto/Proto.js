foam.CLASS({
  package: 'net.nanopay.proto',
  name: 'Proto',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'random'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'subject',
      documentation: `References subject that made update.
        TODO: remove references when subject becomes serializable`,
      postSet: function(o, n) {
        this.userId = n.user.id;
        this.agentId = n.realUser.id;
      },
      javaSetter: `
        // User and Agent summarize
        setUserId(((foam.nanos.auth.User) val.getUser()).getId());
        setUser(((foam.nanos.auth.User) val.getUser()).toSummary());
        setAgentId(((foam.nanos.auth.User) val.getRealUser()).getId());
        setAgent(((foam.nanos.auth.User) val.getRealUser()).toSummary());
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'agentId'
    },
    {
      class: 'String',
      name: 'user',
      label: 'Updated By',
      documentation: 'User that made the update.',
      tableWidth: 200
    },
    {
      class: 'String',
      name: 'agent',
      label: 'Updated By',
      documentation: 'Agent that made the update'
    },
  ]
});
