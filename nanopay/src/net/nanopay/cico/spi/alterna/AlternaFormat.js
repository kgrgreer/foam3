foam.CLASS({
  package: 'net.nanopay.cico.spi.alterna',
  name: 'AlternaFormat',

  documentation: 'Cashout and Cashin CSV Format for alterna.',

  properties: [
    {
      class: 'String',
      name: 'padType',
      value: 'Personal'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'transitNumber'
    },
    {
      class: 'String',
      name: 'bankNumber'
    },
    {
      class: 'String',
      name: 'accountNumber'
    },
    {
      class: 'String',
      name: 'amountDollar'
    },
    {
      class: 'String',
      name: 'txnType'
    },
    {
      class: 'String',
      name: 'txnCode',
      value: '729'
    },
    {
      class: 'String',
      name: 'processDate'
    },
    {
      class: 'String',
      name: 'reference'
    }
  ]
});