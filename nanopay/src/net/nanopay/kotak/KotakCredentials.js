foam.CLASS({
  package: 'net.nanopay.kotak',
  name: 'KotakCredentials',

  axioms: [foam.pattern.Singleton.create()],

  properties: [
    {
      class: 'Boolean',
      name: 'enable'
    },
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
    },
    {
      class: 'String',
      name: 'msgSource'
    },
    {
      class: 'String',
      name: 'clientCode'
    },
    {
      class: 'String',
      name: 'myProdCode'
    },
    {
      class: 'String',
      name: 'remitterName',
      documentation: 'remitter should always be nanopay for now'
    },
    {
      class: 'String',
      name: 'remitterAddress',
    },
    {
      class: 'String',
      name: 'remitterAcNo'
    },
    {
      class: 'String',
      name: 'remitterCountry'
    },
    {
      class: 'Long',
      name: 'tradePurposeCodeLimit'
    },
    {
      class: 'Long',
      name: 'transactionFee'
    }
  ]
});
