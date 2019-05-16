foam.INTERFACE({
  package: 'net.nanopay.account',
  name: 'Debtable',
  documentation: ` This account can have a debt, must implement the debtor/debtAccounts relationship and return many debtAccount`,
  methods: [

    {
      name: 'getDebtAccounts',
      documentation: 'get My debtAccounts',
      type: 'net.nanopay.account.DebtAccount[]',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
  ]
})
