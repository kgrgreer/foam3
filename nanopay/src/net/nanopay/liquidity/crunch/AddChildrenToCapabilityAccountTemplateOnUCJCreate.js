/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AddChildrenToCapabilityAccountTemplateOnUCJCreate',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',


  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.crunch.*',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Map',
    'java.util.Set',
    'java.util.HashSet'
  ],

  properties: [
    {
      name: 'accountsMap',
      class: 'Map',
      javaType: 'java.util.Map<String, CapabilityAccountData>'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            if ( ! ( ucj.getData() instanceof CapabilityAccountTemplate ) ) return;

            Map<String, CapabilityAccountData> map = ((CapabilityAccountTemplate) ucj.getData()).getAccounts();
            Set<String> accountIds = map.keySet();

            for ( String accountId : accountIds ) {
              getAccountsMap().put(accountId, map.get(accountId));
              addChildrenToTemplate(x, accountId, map.get(accountId));
            }

            AccountApproverMap ucjData = new AccountApproverMap.Builder(x).setAccounts(getAccountsMap()).build();

            ucj.setData(ucjData);
          }
        }, "Add children to CapabilityAccountTemplate on ucj create");
      `
    },
    {
      name: 'addChildrenToTemplate',
      args: [ 
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'accountId', class: 'String' },
        { name: 'data', javaType: 'CapabilityAccountData' }
      ],
      javaCode: `

        DAO accountDAO = (DAO) x.get("accountDAO");
        Account tempAccount = (Account) accountDAO.find(Long.parseLong(accountId));
        List<Account> children = ((ArraySink) ((DAO) tempAccount.getChildren(x)).select(new ArraySink())).getArray();

        Set<Account> accountsSet = new HashSet<Account>(children); 
        accountsSet.addAll(children); 

        while ( children.size() > 0 ) {
          tempAccount = children.get(0);
          List<Account> tempChildren = ((ArraySink) ((DAO) tempAccount.getChildren(x)).select(new ArraySink())).getArray();
          for ( Account tempChild : tempChildren ) {
            if ( ! children.contains(tempChild) ) children.add(tempChild);
            accountsSet.add(tempChild);
          }
          children.remove(0);
        }

        for ( Account account : accountsSet ) {
          if ( ! getAccountsMap().containsKey(String.valueOf(account.getId()))) getAccountsMap().put(String.valueOf(account.getId()), data);
        }
      `
    }
  ]
})
    