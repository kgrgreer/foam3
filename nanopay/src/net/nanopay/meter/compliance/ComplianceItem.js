foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceItem',
  label: 'Compliance Responses',

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  documentation: `The Compliance Item`,

  tableColumns: [
    'responseId',
    'type',
    'user',
    'userLabel',
    'created'
  ],

  searchColumns: [
    'user',
    'userLabel'
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
      class: 'String',
      name: 'userLabel',
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
      class: 'String',
      name: 'type',
      transient: true,
      expression: function(dowJones, identityMind, levResponse, sidniResponse) {
        if ( dowJones ) {
          return "DOW Jones";
        } else if ( identityMind ) {
          return "Identity Mind";
        } else if ( levResponse ) {
          return "Secure Fact (LEV)";
        } else if ( sidniResponse ) {
          return "Secure Fact (SIDni)";
        } else {
          return "";
        }
      },
      hidden: true
    }
  ]
});
