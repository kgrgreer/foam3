foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniResponse',
  documentation: `The object for a SIDni response`,

  tableColumns: [
    'id', 'name', 'entityId', 'verified', 'reason'
  ],

  imports: [
    'userDAO'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      label: 'Entity Name'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'entityId',
      label: 'Entity Id'
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
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniDataSources',
      name: 'dataSources'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniAdditionalMatchInfo',
      name: 'additionalMatchInfo'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniErrorComponent',
      name: 'errors'
    },
  ]
});
