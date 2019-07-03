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
    'transaction',
    'entityLabel',
    'created'
  ],

  searchColumns: [
    'user',
    'entityLabel',
    'type'
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
        if( dowJones ) {
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
      class:'String',
      name: 'type',
      transient: true,
      tableWidth: 300,
      getter: function() {
        if ( this.dowJones ) {
          return this.dowJones$find.then(o => {
            return "Dow Jones (" + o.searchType + ")";
          })
        } else if ( this.identityMind ) {
          return this.identityMind$find.then(o => {
            return "IdentityMind (" + o.apiName + ")";
          })
        } else if ( this.levResponse ) {
          return "Secure Fact (LEV)";
        } else if ( this.sidniResponse ) {
          return "Secure Fact (SIDni)";
        } else {
        return "";
        }
      }
    },
  ]
});
