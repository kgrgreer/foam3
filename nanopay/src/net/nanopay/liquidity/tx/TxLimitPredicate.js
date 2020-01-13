foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'TxLimitPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the rule applies to the transaction',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],
  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.tx.TxLimitEntityType',
      name: 'entityType'
    },
    {
      class: 'Long',
      name: 'id',
      documentation: 'ID of the entity that is being limited.'
    },
    {
      class: 'Boolean',
      name: 'send'
    },
    {
      class: 'Boolean',
      name: 'includeChildAccounts',
      documentation: 'Whether to include child accounts when the entity type is ACCOUNT.'
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
        // Retrieve the transaction
        Transaction tx = (Transaction) NEW_OBJ.f(obj);

        // Only check digital transactions
        if ( ! ( tx instanceof DigitalTransaction )) {
          return false;
        }    

        // Always matches for transactions
        // if (this.getEntityType() == TxLimitEntityType.TRANSACTION) {
        //   return true;
        // }

        // When there is no ID to match, always return false
        if (this.getId() == 0) {
          return false;
        }

        // Retrieve the account
        Account account = getSend() ? tx.findSourceAccount((X) obj) : tx.findDestinationAccount((X) obj);
        if (this.getEntityType() == TxLimitEntityType.ACCOUNT) {
          // When including children, use the custom predicate
          if (this.getIncludeChildAccounts()) {
            IsChildAccountPredicate isChildAccountPredicate = new IsChildAccountPredicate.Builder((X) obj)
              .setParentId(this.getId())
              .build();
            return isChildAccountPredicate.f(account);
          }

          // Check if account IDs match exactly
          return account.getId() == this.getId();
        }

        // Retrieve the users
        User user = account.findOwner((X) obj);
        if (this.getEntityType() == TxLimitEntityType.USER) {
          return user.getId() == this.getId();
        }

        // otherwise this is an unknown entity type
        return false;
      `
    }
  ]
});
