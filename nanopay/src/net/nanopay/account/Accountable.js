foam.INTERFACE({
  package: 'net.nanopay.account',
  name: 'Accountable',
  documentation: ` The Accountable interface allows an object to have a balance, as well as forwards, and source funds
  from specified accounts. Accountable objects can be thought of as decorators for other accounts.`,
  methods: [
    {
      name: 'handle',
      documentation: `Properly handle a transaction that either originates from, or its destination.
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
      documentation: 'report balance',
      type: 'Long',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
    // TODO: decide if findTrust Account makes sense in Interface. What is the trust account of User/Invoice?
    // the trust account of final ending account of accountification chain?
      name: 'findTrust',
      type: 'net.nanopay.account.TrustAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      documentation: `There are three ways to find an accounts trustAccount. 1. Explicit reference,
       2. Walking the tree of accounts upwards to the top parent, 3. get the default based on currency.`
    }
  ]
})
