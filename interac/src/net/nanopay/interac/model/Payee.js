foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'Payee',
  documentation: 'Transaction recipient',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'middleName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name:  'nationalId'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name:  'phone'
    },
    {
      class: 'String',
      name:  'phoneNumber'
    },
    {
      class: 'Boolean',
      name: 'phoneNumberVerified',
      writePermissionRequired: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name:  'address'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name:  'account'
    }
  ]
});
