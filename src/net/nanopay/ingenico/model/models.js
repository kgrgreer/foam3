foam.CLASS({
  package: 'net.nanopay.ingenico.model',
  name: 'Transaction',

  documentation: 'Transaction',

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true,
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'image'
    },
    {
      class: 'String',
      name: 'datetime'
    },
    {
      class: 'String',
      name: 'amount'
    },
    {
      class: 'Boolean',
      name: 'pending'
    },
    {
      class: 'String',
      name: 'tip'
    },
    {
      class: 'String',
      name: 'total'
    }
  ]
});