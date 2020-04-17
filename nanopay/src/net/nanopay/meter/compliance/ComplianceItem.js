foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceItem',
  label: 'Compliance Responses',

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  requires: [
    'foam.dao.DAO'
  ],

  documentation: `The Compliance Item`,

  tableColumns: [
    'responseId',
    'type',
    'user',
    'entityLabel',
    'summary',
    'created'
  ],

  searchColumns: [
    'responseId',
    'type',
    'user',
    'entityLabel',
    'created'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
      targetDAOKey: 'dowJonesResponseDAO',
      name: 'dowJones'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
      targetDAOKey: 'identityMindResponseDAO',
      name: 'identityMind'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
      targetDAOKey: 'securefactLEVDAO',
      name: 'levResponse'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
      targetDAOKey: 'securefactSIDniDAO',
      name: 'sidniResponse'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      targetDAOKey: 'userDAO',
      name: 'user',
      label: 'User/Business ID'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      targetDAOKey: 'transactionDAO',
      name: 'transaction',
      label: 'Transaction ID'
    },
    {
      class: 'String',
      name: 'entityLabel',
      label: 'Entity Name'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date'
    },
    {
      class: 'Long',
      name: 'responseId',
      transient: true,
      label: 'ID',
      tableWidth: 50,
      expression: function(dowJones, identityMind, levResponse, sidniResponse) {
        if ( dowJones ) {
          return dowJones;
        } else if ( identityMind ) {
          return identityMind;
        } else if ( levResponse ) {
          return levResponse;
        } else if ( sidniResponse ) {
          return sidniResponse;
        } else {
          return 0;
        }
      },
      hidden: true
    },
    {
      class: 'String',
      name: 'type',
      tableWidth: 300
    },
    {
      class: 'String',
      name: 'summary',
      expression: function() {
        return this.toSummary();
      }
    }
  ],

  methods: [
    {
      name: 'toSummary',
      code: async function(x) {
        if ( this.sidniResponse != 0 ) {
          let response = await this.sidniResponse$find;
          return response.toSummary();
        }
        return "";
      }
    }
  ]
});
