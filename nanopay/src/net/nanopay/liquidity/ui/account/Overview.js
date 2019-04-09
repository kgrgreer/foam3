foam.CLASS({
  package: 'net.nanopay.liquidity.ui.account',
  name: 'Overview',
  imports: [
    'data'
  ],
  properties: [
    {
      class: 'DateTime',
      name: 'createdOn',
      visibility: 'RO',
      expression: function(data$created) {
        return data$created;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibility: 'RO',
      expression: function(data$createdBy) {
        return data$createdBy;
      }
    },
    {
      class: 'String',
      name: 'accountType',
      visibility: 'RO',
      expression: function(data$type) {
        return data$type;
      }
    },
    {
      class: 'String',
      name: 'lastTransaction',
      visibility: 'RO',
      value: 'TODO'
    },
    {
      class: 'Float',
      name: 'averageTransactionSize',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'fundedBy',
      visibility: 'RO',
      value: 'TODO'
    }
  ]
});
