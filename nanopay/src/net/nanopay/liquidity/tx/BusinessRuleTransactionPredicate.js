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
    'net.nanopay.liquidity.tx.IsChildAccountPredicate',
    'static foam.mlang.MLang.*',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'isSourcePredicate'
    },
    {
      class: 'Boolean',
      name: 'includeChildAccounts'
    },
    {
      class: 'Long',
      name: 'parentId'
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
        X x = (X) obj;
        Binary binaryPredicate = (Binary) this.getPredicate();
        PropertyExpr propertyExpr = (PropertyExpr) binaryPredicate.getArg1();
        Transaction tx = (Transaction) NEW_OBJ.f(obj);

        // Apply to transaction
        if (propertyExpr.getOf() == Transaction.getOwnClassInfo()) {
          return binaryPredicate.f(tx);
        }

        // Apply to account
        Account account = this.getIsSourcePredicate() ? tx.findSourceAccount(x) : tx.findDestinationAccount(x);
        if (propertyExpr.getOf() == Account.getOwnClassInfo()) {
          if ( this.getIncludeChildAccounts() ) {
            IsChildAccountPredicate isChildAccountPredicate = new IsChildAccountPredicate.Builder(x)
              .setParentId(this.getParentId())
              .build();
            return isChildAccountPredicate.f(account);
          }
          return binaryPredicate.f(account);
        }
        
        // Apply to user
        if (propertyExpr.getOf() == User.getOwnClassInfo()) {
          User user = account.findOwner(x);
          return binaryPredicate.f(user);
        }

        // Otherwise do nothing
        return false;
      `
    }
  ]
});
