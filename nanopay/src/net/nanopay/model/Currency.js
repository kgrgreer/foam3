foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Currency',

  documentation: 'Currency information.',

  ids: [
    'alphabeticCode'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of currency.',
      required: true
    },
    {
      class: 'String',
      name: 'alphabeticCode',
      documentation: 'Alphabetic code of currency.',
      required: true
    },
    {
      class: 'Long',
      name: 'numericCode',
      documentation: 'Numberic code of currency.',
      required: true
    },
    {
      class: 'Int',
      name: 'precision',
      documentation: 'precision of decimal points.',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      documentation: 'Reference to affiliated country.',
      name: 'country'
    },
    {
      class: 'String',
      name: 'delimiter',
    },
    {
      class: 'String',
      name: 'leftOrRight'
    },
    {
      class: 'String',
      name: 'flagImage',
      documentation: 'Flag image used in relation to currency.'
    }
  ]
});
