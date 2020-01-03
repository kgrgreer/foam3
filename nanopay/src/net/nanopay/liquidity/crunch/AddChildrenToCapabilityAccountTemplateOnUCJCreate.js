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
      javaType: 'java.util.Map<String, >'
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

            Map<String, CapabilityAccountData> map = ((CapabilityAccountTemplate) ucj.getData()).getAccounts();oo
            Set<String> accountIds = map.keySet();

            for ( String accountId : accountIds ) {
              map = addChildrenToTemplate(x, accountId, map);
            }

            CapabilityAccountTemplate template = ((CapabilityAccountTemplate) ucj.getData());
            template.setAccounts(map);

            ucj.setData(template);
            DAO dao = (DAO) x.get("capabilityAccountTemplateDAO");
            template.setId(template.getId() + 1000);
            dao.put(template);
          }
        }, "Add children to CapabilityAccountTemplate on ucj create");
      `
    },
    {
      name: 'addChildrenToTemplate',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'accountId', class: 'String' },
        { name: 'map', javaType: 'Map<String, CapabilityAccountData>' }
      ],
      javaType: 'Map<String, CapabilityAccountData>',
      javaCode: `
      CapabilityAccountData data = map.get(accountId);
        if ( data == null ) throw new RuntimeException("Null CapabilityAccountData provided in CapabilityAccountTemplate map");

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
          if ( ! map.containsKey(String.valueOf(account.getId()))) map.put(String.valueOf(account.getId()), data);
        }
        return map;
      `
    }
  ]
})
    