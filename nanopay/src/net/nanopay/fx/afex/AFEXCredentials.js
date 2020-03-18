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
    },
    {
      class: 'Long',
      name: 'internationalFee',
      label: 'International fee'
    },
    {
      class: 'Long',
      name: 'domesticFee',
      label: 'Domestic fee'
    },
    {
      class: 'Int',
      name: 'clientApprovalDelay',
      value: 5,
      documentation: 'Wait time in minutes before AFEX business is approved.'
    },
  ]
});
