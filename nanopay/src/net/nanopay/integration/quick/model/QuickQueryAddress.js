foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryAddress',
  documentation: 'Class for Address from Quick Accounting Software',
  properties: [
    {
      class: 'Date',
      name: 'Id'
    },
    {
      class: 'Date',
      name: 'Line1'
    },
    {
      class: 'String',
      name: 'City'
    },
    {
      class: 'String',
      name: 'CountrySubDivisionCode'
    },
    {
      class: 'Date',
      name: 'PostalCode'
    },
    {
      class: 'String',
      name: 'Lat'
    },
    {
      class: 'String',
      name: 'Long'
    }
  ]
});
