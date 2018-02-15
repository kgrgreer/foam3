foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Currency',

  documentation: 'Currency information.',

  ids: [ 'alphabeticCode' ],

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'alphabeticCode',
      required: true
    },
    {
      class: 'Long',
      name: 'numericCode',
      required: true
    },
    {
      class: 'Int',
      name: 'precision',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country'
    },
    {
      class: 'String',
      name: 'delimiter'
    },
    {
      class: 'String',
      name: 'leftOrRight'
    }
  ]
});
