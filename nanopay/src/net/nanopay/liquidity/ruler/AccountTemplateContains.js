foam.CLASS({
  package: 'net.nanopay.liquidity.ruler',
  name: 'AccountTemplateContains',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  implements: [
    'foam.core.Serializable'
  ],

  documentation: 'Returns true if the account template contains an account',

  javaImports: [
    'foam.core.X',
    'net.nanopay.liquidity.crunch.AccountMap',
    'net.nanopay.liquidity.tx.AccountHierarchy',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'accountProperty',
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.crunch.AccountTemplate',
      name: 'accountTemplate'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        AccountHierarchy accountHierarchy = (AccountHierarchy) x.get("accountHierarchy");
        AccountMap accountMap = accountHierarchy.getAccountsFromAccountTemplate(x, findAccountTemplate(x));

        return accountMap.getAccounts().containsKey(
          String.valueOf( DOT(NEW_OBJ, getAccountProperty()).f(obj) )
        );
      `
    }
  ]
});
