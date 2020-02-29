foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'DirectDebitEnrollmentRequest',
  properties: [
    {
      class: 'String',
      name: 'APIKey'
    },
    {
      class: 'String',
      name: 'AccountOwnerFirstName'
    },
    {
      class: 'String',
      name: 'AccountOwnerLastName'
    },
    {
      class: 'String',
      name: 'BankName'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    },
    {
      class: 'String',
      name: 'BankRoutingCode'
    },
    {
      class: 'String',
      name: 'Currency'
    },
    {
      class: 'Boolean',
      name: 'BankDetailsVerified'
    }
  ]
});
