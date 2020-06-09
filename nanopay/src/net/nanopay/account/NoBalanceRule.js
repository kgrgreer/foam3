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
  package: 'net.nanopay.account',
  name: 'NoBalanceRule',

  documentation: `Validator that checks if account has a zero balance or not.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.account.DigitalAccount'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      if ( obj instanceof DigitalAccount ) {
        DigitalAccount digitalAccount = (DigitalAccount) obj;
        long balance = (long) digitalAccount.findBalance(x);
        if ( balance != 0 ) {
          Logger logger = (Logger) x.get("logger");
          logger.log("Cannot delete account " + digitalAccount.getId() + " as it has a balance of " + balance);
          throw new  RuntimeException("Cannot delete this account as its balance is not 0");
        }
      }
      `
    }
  ]
});
