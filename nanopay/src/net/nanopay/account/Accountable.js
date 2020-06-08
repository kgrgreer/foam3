/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
      name: 'balance',
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
      documentation: 'can the accountable object accept this denomination?',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'denomination',
          type: 'String'
        }
      ]
    }
  ]
})
