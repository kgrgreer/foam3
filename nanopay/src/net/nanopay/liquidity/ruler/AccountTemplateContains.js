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
  package: 'net.nanopay.liquidity.ruler',
  name: 'AccountTemplateContains',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  implements: [
    'foam.core.Serializable'
  ],

  documentation: 'Returns true if the account template contains an account',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.liquidity.crunch.AccountTemplate',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'accountProperty',
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.crunch.AccountTemplate',
      name: 'accountTemplate'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        DAO accountTemplateDAO = (DAO) x.get("accountTemplateDAO");

        AccountTemplate accountTemplate = (AccountTemplate) accountTemplateDAO.find(getAccountTemplate());

        return accountTemplate.getAccounts().contains(
          DOT(NEW_OBJ, getAccountProperty()).f(obj)
        );
      `
    }
  ]
});
