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
  name: 'SecuritiesAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'The base model for creating and managing all Security accounts.',

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.LifecycleState',
    'foam.util.SafetyUtil'
  ],

  searchColumns: [
    'name', 'id', 'denomination', 'type'
  ],

  tableColumns: [
    'id',
    'name',
    'type',
    'denomination.name',
    'balance'
  ],

  properties: [
    {
      //not required, except maybe for view.
      class: 'Reference',
      of: 'foam.core.Unit',
      targetDAOKey: 'currencyDAO',
      name: 'denomination',
      documentation: 'The security that this account stores.',
      tableWidth: 127,
      section: 'accountInformation',
      value: 'USD',
      order: 3,
    }
  ],

  methods: [
    {
      name: 'getSecurityAccount',
      type: 'net.nanopay.account.SecurityAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'unit',
          type: 'String'
        }
      ],

      javaCode: `
        DAO accountDAO = (DAO) this.getSubAccounts(x);
        // TODO: switch to StripedLock when available, KGR
        Object lock = (getId() + ":" + unit).intern();
        synchronized ( lock ) {
          SecurityAccount sa = (SecurityAccount) accountDAO.find(EQ(
          SecurityAccount.DENOMINATION,unit));
          if ( sa == null || SafetyUtil.isEmpty(sa.getId()) )
            return createSecurityAccount_(x,unit);
          return sa;
        }
      `
    },
    {
      name: 'createSecurityAccount_',
      documentation: 'creates a subaccount that is denominated with the specified unit',
      type: 'net.nanopay.account.SecurityAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'unit',
          type: 'String'
        }
      ],

      javaCode: `
        SecurityAccount sa = new SecurityAccount();
        sa.setDenomination(unit);
        sa.setName(unit + " subAccount for " + getId());
        sa.setSecuritiesAccount(this.getId());
        sa.setLifecycleState(LifecycleState.ACTIVE);
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        sa = (SecurityAccount) accountDAO.put(sa);
        return sa;
      `
    },
  ]
});
