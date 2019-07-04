foam.CLASS({
  package: 'net.nanopay.flinks',
  name: 'ClientFlinksAuthService',

  implements: [
    'net.nanopay.flinks.FlinksAuth'
  ],

  javaImports: [
    'net.nanopay.flinks.model.FlinksRespMsg'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.flinks.FlinksAuth',
      name: 'delegate'
    }
  ]
})