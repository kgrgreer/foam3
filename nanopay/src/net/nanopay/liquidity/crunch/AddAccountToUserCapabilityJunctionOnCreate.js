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
  package: 'net.nanopay.liquidity.crunch',
  name: 'AddAccountToUserCapabilityJunctionOnCreate',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',


  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.core.NumberSet',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.crunch.*',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'java.util.ArrayList',
    'foam.mlang.MLang'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            //TODO: fix numberSet for string id
            if ( true ) throw new RuntimeException("fix numberSet for string id in AddAccountToUserCapabilityJunctionOnCreate");

            // Account account = (Account) obj;
            // Long accountId = account.getId();
            // Long parentId = account.getParent();

            // // get all ucjs where it is account-based
            // DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
            
            // // non account-based capabilities do not store anything in data
            // List<UserCapabilityJunction> ucjs = ((ArraySink) ucjDAO
            //   .where(MLang.NEQ(UserCapabilityJunction.DATA, null))
            //   .select(new ArraySink())).getArray();

            // for ( UserCapabilityJunction ucj : ucjs ) {
            //   if ( ! ( ucj.getData() instanceof NumberSet ) ) continue;              
            //   NumberSet numberSet = (NumberSet) ucj.getData();
                            
            //   if ( numberSet.contains(parentId) ) {
            //     numberSet.add(accountId);
            //     ucj.setData((numberSet));
            //     ucjDAO.put(ucj);
            //   }
            // }
          }
        }, "Add account to ucj data on account create");
      `
    }
  ]
})
    
