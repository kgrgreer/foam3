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
    name: 'RemoveAccountFromRootAccounts',
  
    documentation: 'Rule to remove account from root account dao on account removal',
  
    implements: [
      'foam.nanos.ruler.RuleAction'
    ],
  
    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.ArraySink',
      'foam.dao.DAO',
      'foam.nanos.auth.LifecycleAware',
      'foam.nanos.crunch.UserCapabilityJunction',
      'java.util.List',
      'net.nanopay.account.Account',
      'net.nanopay.liquidity.crunch.RootAccounts'
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ((LifecycleAware) obj).getLifecycleState() == foam.nanos.auth.LifecycleState.DELETED ) {
              DAO rootAccountsDAO = (DAO) x.get("rootAccountsDAO");

              String id = ((Account) obj).getId();

              List<RootAccounts> rootAccountsList= ((ArraySink) rootAccountsDAO
                .select(new ArraySink()))
                .getArray();

              for ( RootAccounts ra : rootAccountsList ) {
                List<String> accountsList = (List<String>) ra.getRootAccounts();
                if ( accountsList.contains(id.toString()) ) {
                  accountsList.remove(id.toString());

                  ra.setRootAccounts(accountsList);

                  rootAccountsDAO.put(ra);
                }
              }
            }
          }
        }, "Remove account from root account dao on account removal");
        `
      }
    ]
  });