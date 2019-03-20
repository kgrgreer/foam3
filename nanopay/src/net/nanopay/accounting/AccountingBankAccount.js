foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'AccountingBankAccount',
  ids: ['quickBooksBankAccountId', 'realmId', 'xeroBankAccountId', 'xeroOrganizationId'],
  properties: [
    {
      class: 'String',
      name: 'currencyCode'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'xeroOrganizationId'
    },
    {
      class: 'String',
      name: 'xeroBankAccountId'
    },
    {
      class: 'String',
      name: 'realmId'
    },
    {
      class: 'String',
      name: 'quickBooksBankAccountId'
    }
  ]
  });
