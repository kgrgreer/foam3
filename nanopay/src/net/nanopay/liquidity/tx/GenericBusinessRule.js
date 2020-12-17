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
  name: 'GenericBusinessRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'Generic Business Rule.',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.tx.*',
    'foam.mlang.*',
    'foam.mlang.expr.*',
    'foam.mlang.predicate.*',
    'foam.mlang.MLang.*',
    'foam.nanos.logger.Logger'
  ],

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.expr.PropertyExpr',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Neq',
    'net.nanopay.account.Account'
  ],

  searchColumns: [
    'id',
    'name',
    'enabled',
    'businessRuleAction',
    'createdBy.legalName',
    'description'
  ],

  properties: [
    { name: 'name' },
    { name: 'description' },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'sourcePredicate',
      label: 'Source Condition',
      section: 'basicInfo',
      factory: function() {
        return this.EQ(this.Account.NAME, 'Source Account');
      },
      javaFactory: `
        return MLang.EQ(Account.NAME, "Source Account");
      `
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'destinationPredicate',
      label: 'Destination Condition',
      section: 'basicInfo',
      factory: function() {
        return this.EQ(this.Account.NAME, 'Destination Account');
      },
      javaFactory: `
        return MLang.EQ(Account.NAME, "Destination Account");
      `
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.tx.BusinessRuleAction',
      name: 'businessRuleAction',
      section: 'basicInfo',
      label: 'Action Type',
      tableWidth: 125
    },
    {
      name: 'ruleGroup',
      value: 'businessRules',
      hidden: true
    },
    {
      name: 'predicate',
      transient: true,
      hidden: true,
      javaGetter: `
        return foam.mlang.MLang.AND(
          (new BusinessRuleTransactionPredicate.Builder(getX())).setIsSourcePredicate(true).setPredicate(this.getSourcePredicate()).build(), 
          (new BusinessRuleTransactionPredicate.Builder(getX())).setIsSourcePredicate(false).setPredicate(this.getDestinationPredicate()).build());
      `
    },
    {
      name: 'action',
      transient: true,
      hidden: true,
      javaGetter: `
        // RESTRICT
        if ( this.getBusinessRuleAction() == BusinessRuleAction.RESTRICT ) {
          ((Logger) getX().get("logger")).warning(this.getId() + " restricting operation. " + this.getDescription());
          return new ExceptionRuleAction.Builder(getX()).setMessage("Operation prevented by business rule: " + this.getId()).build(); // <- seen by users
        }

        // NOTIFY
        if (this.getBusinessRuleAction() == BusinessRuleAction.NOTIFY)
          return new BusinessRuleNotificationAction.Builder(getX())
            .setBusinessRuleId(this.getName())
            .setGroupId("liquidBasic")
            .build();

        // ALLOW
        return null;
      `,
    }
  ]
});
