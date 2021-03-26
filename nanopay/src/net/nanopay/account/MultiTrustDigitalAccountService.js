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
  name: 'MultiTrustDigitalAccountService',

  documentation: 'MultiTrust digital account service',

  implements: [
    'net.nanopay.account.DigitalAccountServiceInterface'
  ],

  javaImports: [
     'java.util.Calendar',
     'static foam.mlang.MLang.AND',
     'static foam.mlang.MLang.EQ',
     'static foam.mlang.MLang.INSTANCE_OF',
     'foam.nanos.auth.LifecycleState',
     'net.nanopay.account.DigitalAccount',
     'net.nanopay.account.TrustAccount',
     'net.nanopay.account.Account',
     'foam.dao.DAO',
     'foam.nanos.auth.Subject',
     'foam.util.SafetyUtil',
     'foam.nanos.auth.User',
     'java.util.List',
     'java.util.ArrayList',
     'foam.dao.ArraySink'
  ],

  properties: [
    {
      name: 'reserveAccountSpid',
      class: 'String',
      value: 'nanopay'
    }
  ],

  methods: [
    {
      name: 'findDefault',
      type: 'net.nanopay.account.DigitalAccount',
      javaCode:`
        User user = ((Subject) x.get("subject")).getUser();
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        //Get the Default account for a specific TrustAccount;
        if ( ! SafetyUtil.isEmpty(trustAccount) )
          return (DigitalAccount) accountDAO.find(AND(
            EQ(Account.OWNER, user.getId()),
            INSTANCE_OF(DigitalAccount.class),
            EQ(DigitalAccount.TRUST_ACCOUNT,trustAccount),
            EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
            EQ(Account.IS_DEFAULT, true)
          ));
        //Get Any default account of a set currency
        if (denomination != null)
          return (DigitalAccount) accountDAO.find(AND(
            EQ(Account.OWNER, user.getId()),
            INSTANCE_OF(DigitalAccount.class),
            EQ(DigitalAccount.DENOMINATION,denomination),
            EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
            EQ(Account.IS_DEFAULT, true)
          ));
        //Get literally any default digital account
        return (DigitalAccount) accountDAO.find(AND(
           EQ(Account.OWNER, user.getId()),
           INSTANCE_OF(DigitalAccount.class),
           EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
           EQ(Account.IS_DEFAULT, true)
        ));
      `
    },
    {
      name: 'createDefaults',
      javaCode: `
        if (trustAccounts == null)
          return;
        checkAndCreateAll_(x, trustAccounts);
      `
    },
    {
      name: 'checkAndCreateAll_',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'trustAccounts', type: 'String[]' }
      ],
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        DAO accountDAO = ((DAO) x.get("localAccountDAO"));
        // get the trust account to generate for
        List trusts = new ArrayList<TrustAccount>();
        for (String tId : trustAccounts) {
          TrustAccount trust = (TrustAccount) accountDAO.find(tId);
          if (trust == null) {
            ((foam.nanos.logger.Logger) x.get("logger")).warning("Trust account not found", tId);
            throw new RuntimeException("MultiTrustService: Incorrect Trust account "+tId);
          }
          trusts.add(trust);
        }
        // make sure each trust has a digital account for the user.
        for (Object o : trusts) {
          TrustAccount t = (TrustAccount) o;
          DigitalAccount defaultDigital = (DigitalAccount) accountDAO.find(AND(
            EQ(Account.OWNER, user.getId()),
            INSTANCE_OF(DigitalAccount.class),
            EQ(DigitalAccount.TRUST_ACCOUNT,t.getId()),
            EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
            EQ(Account.IS_DEFAULT, true)
          ));
          if ( defaultDigital != null )
            continue;
          DigitalAccount account = new DigitalAccount();

          account.setName("Digital Account");
          account.setDenomination(t.getDenomination());
          account.setIsDefault(true);
          account.setOwner(user.getId());
          account.setSpid(user.getSpid());
          account.setLifecycleState(LifecycleState.ACTIVE);
          account.setTrustAccount(t.getId());
          account = (DigitalAccount) accountDAO.put(account);
        }
      `
    }
  ]
});
