foam.CLASS({
  package: 'net.nanopay.tx.planner.predicate',
  name: 'SameUserTxnPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
  documentation: 'if we set sameUser == true, then predicate returns true if source/destination users are same. or true if both false',

  javaImports: [
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.NEW_OBJ'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'sameUser',
      value: true,
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) NEW_OBJ.f(obj);
      if (getSameUser() == ( quote.getSourceAccount().getOwner() == (quote.getDestinationAccount().getOwner())))
        return true;
      return false;
      `
    }
  ]
});
