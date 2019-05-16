foam.INTERFACE({
  package: 'net.nanopay.account',
  name: 'Debtable',
  documentation: ` This account can have a debt, must implement the debtor/debtAccount relationship and return a debtAccount`,

  methods: [
    {
      name: 'findDebtAccount',
      documentation: 'get My debtAccount',
      type: 'Long',
    },
    {
      name: 'findDebtAccount',
      documentation: 'get My debtAccount',
      type: 'net.nanopay.account.DebtAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
  ]
})
