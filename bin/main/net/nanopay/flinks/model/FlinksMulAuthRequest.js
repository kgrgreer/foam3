foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksMulAuthRequest',
  extends: 'net.nanopay.flinks.model.FlinksCall',

  documentation: 'model for Flinks multiple authorize request',

  properties: [
    {
      class: 'StringArray',
      name: 'LoginIds'
    }
  ]
});