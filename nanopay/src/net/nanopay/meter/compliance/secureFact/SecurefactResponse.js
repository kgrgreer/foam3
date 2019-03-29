foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact',
  name: 'SecurefactResponse',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'entityName'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'entityId'
    },
    {
      class: 'Int',
      name: 'statusCode'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.ResponseError',
      name: 'errors'
    }
  ]
});
