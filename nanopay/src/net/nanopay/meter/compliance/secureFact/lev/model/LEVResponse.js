foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev.model',
  name: 'LEVResponse',
  extends: 'net.nanopay.meter.compliance.secureFact.sidni.model.BasicResponseObject',

  tableColumns: [
    'id', 'searchId', 'httpCode'
  ],


  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Int',
      name: 'searchId',
      documentation: 'SecureFact unique serch id.'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'jurisdictionsUnavailable',
      documentation: 'If a jurisdiction is unavailable at the time of the search and results cannot be returned, it will be listed here.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVResult',
      name: 'results'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVError',
      name: 'errors'
    }
  ]
  });
