foam.INTERFACE({
  package: 'net.nanopay.account',
  name: 'Accountable',
  documentation: ` The Accountable interface allows an object to have a balance, as well as forwards, and source funds
  from specified accounts. Accountable objects can be thought of as decorators for other accounts.`,
  methods: [
    {
      name: 'plan',
      documentation: `Properly handle a transaction, based on whether this accountified object is the source or destination.
       Case 1: forwarding txns: return the same txn with child txn(s)
       Case 2: funding txns: return the same txn with parent txn(s?) set for this txn.
       Case 3: nothing happens: return the same txn`,
      type: 'net.nanopay.tx.model.Transaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction',
        }
      ]
    },
    {
      name: 'findBalance',
      documentation: 'report a balance',
      type: 'net.nanopay.account.Balance',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'canAccept',
      documentation: 'can the accountable object accept this denomination?'
      type: 'Boolean',
      args: [
        {
          name: 'denomination',
          type: 'String'
        }
      ]
    }
  ]
})
