foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniResponse',
  extends: 'net.nanopay.meter.compliance.secureFact.sidni.model.BasicResponseObject',
  documentation: `The object for a SIDni response`,

  tableColumns: [
    'id', 'userReference', 'orderId', 'individualName',
    'verified', 'reason'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
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
      name: 'individualName',
    },
    {
      class: 'Boolean',
      name: 'verified',
    },
    {
      class: 'String',
      name: 'reason',
    },
    {
      class: 'Array',
      of: 'String',
      name: 'verifiedSources',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniDataSources',
      name: 'dataSources',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniAdditionalMatchInfo',
      name: 'additionalMatchInfo',
    },
  ]
});
