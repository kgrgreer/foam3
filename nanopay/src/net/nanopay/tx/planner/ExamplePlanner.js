foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'ExamplePlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Example Planner for showing how to write a planner',

  javaImports: [
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account',
    'static foam.mlang.MLang.EQ',
    'foam.dao.DAO'
  ],

/*
  The Planner is written by overwriting the logic of the method "plan"
  plan gives you the following arguments to use:
      1. x  - The Context
      2. quote  - The transactionQuote that the planner needs to quote
      3. requestTxn  - gives the request transaction in the quote.
      4. agency  - Allows use of agency.submit() for all non read operations. used just as in standard rules.

  You must return a transaction object from the plan method. This gets added as a plan to the quote automatically.

  This section should not include any checks for whether or not to run this planner on a transaction. This should be
  done within a predicate that is applied to the planner rule. Don't forget to take advantage of generic predicates!

  Useful functions:

      quote.addTransfer(id of account (Long), amount of transfer (Long) : adds a transfer to the transaction plan

      quoteTxn(x, Transaction to sub plan, whether or not to clear line items) : makes it easy to build split planners. can call transactionPlannerDAO
      and receive the best transaction in one line, with or without also submitting lineitems.

*/
  methods: [
    {
      name: 'plan',
      javaCode: `

        // Create a transaction, or make a fclone of the requestTransaction. Don't modify the requestTxn directly.
        DigitalTransaction dt = new DigitalTransaction();
        dt.copyFrom(requestTxn);

        // Most things that are needed during planning can be taken directly off the quote. No need to do a .find()
        Account sender = quote.getSourceAccount();
        Account destination = quote.getSourceAccount();
        Long amount = 100l;

        // create transfers using addTransfers. No need to add them to anything,
        // as the planner will take care of it for you.
        quote.addTransfer(sender.getId(), -(amount + 1l) );
        quote.addTransfer(destination.getId(), amount);

        //we can get additional things from the DAO because we have x.
        Account myAccount = (Account) ((DAO) x.get("accountDAO")).find(EQ(Account.NAME,"Michal's Account"));

        //If this planner is a split planner, it can also recursively plan its sub parts with the subPlan function.
        Transaction dt2 = quoteTxn(x, dt);
        dt.addNext(dt2);

        // order of transfer creation does not matter. It will always be added to the returned transaction.
        quote.addTransfer(myAccount.getId(), 1l);

        // Simply return the transaction you wish to add as a plan and the rest is taken care of for you.
        return dt;

        // Congratulations, you just added a fully functional planner that makes
        // digital transactions of 100 currency units + dev tax
      `
    },
  ]
});

