foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'CountryAgent',

  documentation: 'Transaction recipient',

  properties: [
    {
      class: 'FObjectProperty',
      name: 'debtorCountry',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'FObjectProperty',
      name: 'creditorCountry',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.common.model.Bank',
      name:  'debtorAgent'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.common.model.Bank',
      name:  'creditorAgent'
    },
    {
      class: 'Double',
      name:  'debtorFee'
    },
    {
      class: 'Double',
      name:  'creditorFee'
    }
  ]
});