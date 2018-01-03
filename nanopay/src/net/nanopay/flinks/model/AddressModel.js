foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AddressModel',

  documentation: 'model for the Flinks address mode',

  properties: [
    {
      class: 'String',
      name: 'CivicAddress'
    },
    {
      class: 'String',
      name: 'City'
    },
    {
      class: 'String',
      name: 'Province'
    },
    {
      class: 'String',
      name: 'PostalCode'
    },
    {
      class: 'String',
      name: 'POBox'
    }
  ]
});