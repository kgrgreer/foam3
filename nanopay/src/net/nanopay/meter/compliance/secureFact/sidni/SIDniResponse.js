foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniResponse',
  extends: 'net.nanopay.meter.compliance.secureFact.SecurefactResponse',

  documentation: `The object for a SIDni response`,

  tableColumns: [
    'id', 'entityName', 'entityId', 'verified', 'reason'
  ],

  properties: [
    {
      class: 'String',
      name: 'userReference',
      documentation: 'User reference id that was passed in.'
    },
    {
      class: 'String',
      name: 'orderId',
      documentation: 'Unique secureFact id associated with the verify request'
    },
    {
      class: 'String',
      name: 'individualName'
    },
    {
      class: 'Boolean',
      name: 'verified'
    },
    {
      class: 'String',
      name: 'reason'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'verifiedSources'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniDataSources',
      name: 'dataSources'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniAdditionalMatchInfo',
      name: 'additionalMatchInfo'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      code: function(x) {
        return this.verified ? "VERIFIED" : "NOT VERIFIED, " + this.reason;
      },
    },
  ]
});
