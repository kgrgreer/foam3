foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAuthResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks success authorized response',

  properties: [
    {
      class: 'String',
      name: 'Institution'
    }
  ]
});