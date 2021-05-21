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
  package: 'net.nanopay.liquidity.tx',
  name: 'IsChildAccountPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if account is a child of specified parent account',

  javaImports: [
    'foam.core.X',
    'java.util.ArrayList',
    'java.util.Set',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.tx.AccountHierarchy',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'parentId'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        // Use AccountHierarchyService to fetch child accounts of parentId then pass childIds into MLang.IN predicate
        AccountHierarchy accountHierarchy = (AccountHierarchy) getX().get("accountHierarchyService");
        Set<Long> childIdSet = accountHierarchy.getChildAccountIds(getX(), this.getParentId());
        ArrayList<Long> childIds = new ArrayList<>(childIdSet);
        return
          IN(Account.ID, childIds)
        .f(obj);
      `
    }
  ]
});
