foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'IsChildAccountPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if account is a child of specified parent account',

  javaImports: [
    'foam.core.X',
    'java.util.ArrayList',
    'java.util.HashSet',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.tx.AccountHierarchy',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Long',
      name: 'parentId'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        // Use AccountHierarchyService to fetch child accounts of parentId then pass childIds into MLang.IN predicate
        AccountHierarchy accountHierarchy = (AccountHierarchy) getX().get("accountHierarchy");
        HashSet<Long> childIdSet = accountHierarchy.getChildAccountIds(getX(), this.getParentId());
        ArrayList<Long> childIds = new ArrayList<>(childIdSet);
        return
          IN(Account.ID, childIds)
        .f(obj);
      `
    }
  ]
});
