foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'BankAccount',

  documentation: 'Bank account information.',

  properties: [
    {
      class: 'String',
      name: 'accountName',
      label: 'Account Name'
    },
    /*
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    */
    {
      class: 'String',
      name: 'transitNumber',
      label: 'Transit No.'
    },
    {
      class: 'String',
      name: 'bankNumber',
      label: 'Inst. No.'
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.'
    }

    /*
    {
      name: 'plugin',
      required: true
    },
    {
      class: 'String',
      name: 'type',
      required: true
    },
    {
      class: 'Boolean',
      name: 'deleted'
    },
    {
      class: 'Boolean',
      name: 'default'
    },
    {
      class: 'Boolean',
      name: 'encrypted'
    }
    */
  ]
});
