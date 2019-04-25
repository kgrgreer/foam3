foam.CLASS({
  package: 'net.nanopay.kotak',
  name: 'KotakCredentials',

  axioms: [foam.pattern.Singleton.create()],

  properties: [
    {
      class: 'String',
      name: 'clientId'
    },
    {
      class: 'String',
      name: 'clientSecret'
    },
    {
      class: 'String',
      name: 'encryptionKey'
    },
    {
      class: 'String',
      name: 'accessTokenUrl'
    },
    {
      class: 'String',
      name: 'paymentUrl'
    },
    {
      class: 'String',
      name: 'reversaltUrl'
    }
  ]
});
