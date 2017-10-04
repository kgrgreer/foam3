foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'CountryAgent',

  documentation: 'Model to detail the Agents responsible for sending and receiving money between the specified countries',

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
      of: 'net.nanopay.model.Branch',
      name:  'debtorAgent'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Branch',
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