foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'BusinessRuleTransactionPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the rule fits the transaction',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.mlang.expr.*',
    'foam.mlang.predicate.*',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account',
    'static foam.mlang.MLang.*',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'isSourcePredicate'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate'
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
        Binary binaryPredicate = (Binary) this.getPredicate();
        PropertyExpr propertyExpr = (PropertyExpr) binaryPredicate.getArg1();
        Transaction tx = (Transaction) NEW_OBJ.f(obj);

        // Apply to transaction
        if (propertyExpr.getOf() == Transaction.getOwnClassInfo()) {
          return binaryPredicate.f(tx);
        }

        // Apply to account
        Account account = this.getIsSourcePredicate() ? tx.findSourceAccount((X) obj) : tx.findDestinationAccount((X) obj);
        if (propertyExpr.getOf() == Account.getOwnClassInfo()) {
          return binaryPredicate.f(account);
        }
        
        // Apply to user
        if (propertyExpr.getOf() == User.getOwnClassInfo()) {
          User user = account.findOwner((X) obj);
          return binaryPredicate.f(user);
        }

        // Otherwise do nothing
        return false;
      `
    }
  ]
});
