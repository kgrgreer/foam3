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

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionQuote',

  documentation: `Select the best transactions and discard the remainder.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.ExternalTransfer',
    'java.util.ArrayList',

  ],

  properties: [
    {
      documentation: `Request quote on behalf of this transaction.`,
      name: 'requestTransaction',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'plans',
      javaValue: 'new Transaction[] {}'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'plan'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      networkTransient: true,
      documentation: 'helper property to be used during planning in order to avoid overuse of transaction.findSourceAccount'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      networkTransient: true,
      documentation: 'helper property to be used during planning in order to avoid overuse of transaction.findDestinationAccount'
    },
    {
      class: 'Long',
      name: 'amount',
      networkTransient: true,
      documentation: 'helper property to be used during planning'
    },
    {
      class: 'Long',
      name: 'destinationAmount',
      networkTransient: true,
      documentation: 'helper property to be used during planning'
    },
    {
      class: 'String',
      name: 'sourceUnit',
      networkTransient: true,
      documentation: 'helper property to be used during planning'
    },
    {
      class: 'String',
      name: 'destinationUnit',
      networkTransient: true,
      documentation: 'helper property to be used during planning'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.TransactionQuote',
      name: 'parent',
      networkTransient: true,
      documentation: 'helper property used during planning to keep track of parent quote when a planner spawns child quotes'
    },
    {
      name: 'myTransfers_',
      class: 'List',
      javaFactory: 'return new ArrayList<Transfer>();',
      networkTransient: true,
      documentation: 'helper property used by planners'
    },
    {
      name: 'alternatePlans_',
      class: 'List',
      javaFactory: 'return new ArrayList<Transaction>();',
      networkTransient: true,
      documentation: 'helper property used by planners'
    },
    {
      name: 'eligibleProviders',
      class: 'Map',
      javaFactory: `
        return new java.util.HashMap<String, Boolean>();
      `,
      networkTransient: true,
      documentation: 'helper property used by planners'
    },
    {
      name: 'corridorsEnabled',
      class: 'Boolean',
      value: false,
      networkTransient: true,
      documentation: 'helper property used by planners'
    },
    {
      class: 'Boolean',
      name: 'showAllLineItems',
      value: true,
      networkTransient: true,
      documentation: 'Set to false to only show SummaryLineItems and lineItems that require user input'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'requestOwner',
      networkTransient: true,
    },
    {
      documentation: `if we are finishing a partial transaction, it is stored here`,
      name: 'partialTransaction',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      javaFactory: 'return null;',
      networkTransient: true,
    },
  ],

  methods: [
    {
      name: 'addPlan',
      args: [
        {
          name: 'plan',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      Transaction[] plans = new Transaction[getPlans().length + 1];
      if ( getPlans().length != 0 ) {
        System.arraycopy(getPlans(), 0, plans, 0, getPlans().length);
        plans[getPlans().length] = plan;
        setPlans(plans);
      } else {
        setPlans(new Transaction[] { plan });
      }
      `
    },
    {
      name: 'addTransfer',
      documentation: 'helper function for adding transfers to the plan',
      args: [
        { name: 'internal', type: 'Boolean' },
        { name: 'account', type: 'String' },
        { name: 'amount', type: 'Long' },
        { name: 'stage', type: 'Long' }
      ],
      javaCode: `
        if (internal)
          getMyTransfers_().add( new Transfer(account, amount, stage) );
        else
          getMyTransfers_().add( new ExternalTransfer(account, amount, stage) );
      `
    },
  ]
});
