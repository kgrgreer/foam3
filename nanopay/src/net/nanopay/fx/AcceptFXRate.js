foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'AcceptFXRate',

  documentation: 'API to ACCEPT FX Quote',

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'id',
      documentation: 'Refers to Quote ID'
    },
    {
      class: 'String',
      name: 'endToEndId'
    },
    {
      class: 'String',
      name: 'dealReferenceNumber'
    }
  ]
});
