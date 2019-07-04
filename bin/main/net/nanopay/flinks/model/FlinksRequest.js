foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksRequest',
  extends: 'net.nanopay.flinks.model.FlinksCall',
  abstract: 'true',

  documentation: 'model for Flinks request',

  properties:[
    {
      class: 'String',
      name: 'CustomerId'
    },
    {
      class: 'String',
      name: 'RequestId'
    }
  ]
});