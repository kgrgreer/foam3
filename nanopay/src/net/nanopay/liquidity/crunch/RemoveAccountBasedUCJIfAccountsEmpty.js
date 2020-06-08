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
  name: 'RemoveAccountBasedUCJIfAccountsEmpty',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',


  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.liquidity.crunch.AccountApproverMap',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            if ( ( ucj.getData() instanceof AccountApproverMap ) && ((AccountApproverMap) ucj.getData()).getAccounts().size() == 0 ) {
              DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
              ucjDAO.remove(ucjDAO.find(ucj.getId()));
            }
          }
        }, "remove ucj if all accounts have been revoked");
      `
    }
  ]
})
    