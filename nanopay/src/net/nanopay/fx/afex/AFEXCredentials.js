foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXCredentials',

  //axioms: [foam.pattern.Singleton.create()],

  properties: [
    {
      class: 'String',
      name: 'apiKey'
    },
    {
      class: 'String',
      name: 'apiPassword'
    },
    {
      class: 'String',
      name: 'partnerApi'
    },
    {
      class: 'String',
      name: 'AFEXApi'
    },
    {
      class: 'Int',
      name: 'quoteExpiryTime'
    }
  ]
});
