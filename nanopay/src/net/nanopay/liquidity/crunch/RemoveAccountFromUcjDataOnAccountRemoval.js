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
    name: 'RemoveAccountFromUcjDataOnAccountRemoval',
  
    documentation: 'Rule to remove account from ucj data on account removal',
  
    implements: [
      'foam.nanos.ruler.RuleAction'
    ],
  
    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.NumberSet',
      'foam.core.X',
      'foam.dao.ArraySink',
      'foam.dao.DAO',
      'foam.nanos.auth.LifecycleAware',
      'foam.nanos.crunch.UserCapabilityJunction',
      'java.util.List',
      'net.nanopay.account.Account'
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            //TODO: fix numberSet for string id
            if ( true ) throw new RuntimeException("fix numberSet for string id in RemoveAccountFromUcjDataOnAccountRemoval");

            // if ( ((LifecycleAware) obj).getLifecycleState() == foam.nanos.auth.LifecycleState.DELETED ) {
            //   DAO dao = (DAO) x.get("userCapabilityJunctionDAO");

            //   String id = ((Account) obj).getId();

            //   List<UserCapabilityJunction> list= ((ArraySink) dao
            //     .select(new ArraySink()))
            //     .getArray();

            //   for ( UserCapabilityJunction ucj : list ) {
            //     if ( ucj.getData() instanceof NumberSet ) {
            //       NumberSet numberSet = (NumberSet) ucj.getData();

            //       if ( numberSet.contains(id) ) {
            //         numberSet.remove(id);
            //         ucj.setData(numberSet);
            //         dao.put(ucj);
            //       }
            //     }
            //   }
            // }
          }
        }, "Remove accounts from ucjdata on account removal");
        `
      }
    ]
  });