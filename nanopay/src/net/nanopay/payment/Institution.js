foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'Institution',
  documentation: 'Bank/Institution',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      label: 'Name',
      required: true
    },
    {
      class: 'String',
      name: 'abbreviation',
    },
    {
      class: 'String',
      name: 'institutionNumber'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryId',
      label: 'Country'
    }
  ]
});
