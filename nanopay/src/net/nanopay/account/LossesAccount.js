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
  name: 'LossesAccount',
  extends: 'net.nanopay.account.ZeroAccount',

  javaImports: [
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'java.util.List'
  ],

  properties: [
    {
      documentation: 'The associated Trust account',
      name: 'trustAccount',
      class: 'Reference',
      of: 'net.nanopay.account.TrustAccount',
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public LossesAccount find(X x, User sourceUser, String currency) {
            Logger logger   = (Logger) x.get("logger");
            User user = zeroAccountUser(x, sourceUser.findSpid(x), currency);

            List accounts = ((ArraySink)((DAO)x.get("localAccountDAO"))
                            .where(
                              AND(
                                INSTANCE_OF(LossesAccount.class),
                                EQ(Account.OWNER, user.getId()),
                                EQ(Account.DENOMINATION, currency)
                              )
                            )
                            .select(new ArraySink())).getArray();
            if ( accounts.size() == 0 ) {
              logger.error("Losses account not found for", user.getId());
              throw new RuntimeException("Losses account not found for "+user.getId());
            } else if ( accounts.size() > 1 ) {
              logger.error("Multiple Losses accounts found for", user.getId());
              throw new RuntimeException("Multiple Losses accounts found for "+ user.getId());
            }
            return (LossesAccount) accounts.get(0);
          }

          static public LossesAccount find(X x, Account account) {
            return find(x, account.findOwner(x), account.getDenomination());
          }

          static public LossesAccount find(X x, User sourceUser, Currency currency) {
            return find(x, sourceUser, currency.getId());
          }
      `);
      }
    }
  ]
});
