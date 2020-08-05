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
  name: 'RestrictUsersRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',

  documentation: 'Prevents specified users from transacting.',

  javaImports: [
    'net.nanopay.liquidity.tx.*',
    'foam.mlang.*',
    'foam.mlang.expr.*',
    'foam.mlang.predicate.*',
    'foam.mlang.MLang.*',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger'
  ],

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.expr.PropertyExpr',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Neq',
    'foam.nanos.auth.User'
  ],

  searchColumns: [
    'id',
    'name',
    'enabled',
    'createdBy.id'
  ],

  properties: [
    { name: 'name' },
    { name: 'description' },
    {
      class: 'Reference',
      name: 'sourceUser',
      section: 'basicInfo',
      targetDAOKey: 'userDAO',
      of: 'foam.nanos.auth.User',
      view: {
        class: 'foam.u2.view.ReferenceView',
        placeholder: '--'
      },
      tableCellFormatter: function(value) {
        var self = this;
        this.__subSubContext__.userDAO.find(value).then((user)=> {
          user.firstName && user.lastName ? self.add(user.firstName + ' ' + user.lastName) : self.add(user.email);
        });
      },
      validationPredicates: [
        {
          args: ['sourceUser'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.liquidity.tx.RestrictUsersRule.SOURCE_USER, 0);
          },
          errorString: 'Source user must be set.'
        }
      ]
    },
    {
      class: 'Reference',
      name: 'destinationUser',
      section: 'basicInfo',
      targetDAOKey: 'userDAO',
      of: 'foam.nanos.auth.User',
      view: {
        class: 'foam.u2.view.ReferenceView',
        placeholder: '--'
      },
      tableCellFormatter: function(value) {
        var self = this;
        this.__subSubContext__.userDAO.find(value).then((user)=> {
          user.firstName && user.lastName ? self.add(user.firstName + ' ' + user.lastName) : self.add(user.email);
        });
      },
      validationPredicates: [
        {
          args: ['destinationUser'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.liquidity.tx.RestrictUsersRule.DESTINATION_USER, 0);
          },
          errorString: 'Destination user must be set.'
        }
      ]
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'sourcePredicate',
      expression: function(sourceUser) {
        var expr = this.PropertyExpr.create({
          of: 'foam.nanos.auth.User',
          property: this.User.ID
        });
        var cons = this.Constant.create({
          value: sourceUser
        });
        var pred = this.Eq.create({
          arg1: expr,
          arg2: cons
        });
        return pred;
      },
      javaGetter: `
        return new Eq.Builder(getX())
          .setArg1(new PropertyExpr.Builder(getX())
            .setOf(User.getOwnClassInfo())
            .setProperty(User.ID)
            .build())
          .setArg2(new Constant.Builder(getX())
            .setValue(this.getSourceUser())
            .build())
          .build();
      `,
      hidden: true
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'destinationPredicate',
      expression: function(destinationUser) {
        var expr = this.PropertyExpr.create({
          of: 'foam.nanos.auth.User',
          property: this.User.ID
        });
        var cons = this.Constant.create({
          value: destinationUser
        });
        var pred = this.Eq.create({
          arg1: expr,
          arg2: cons
        });
        return pred;
      },
      javaGetter: `
        return new Eq.Builder(getX())
          .setArg1(new PropertyExpr.Builder(getX())
            .setOf(User.getOwnClassInfo())
            .setProperty(User.ID)
            .build())
          .setArg2(new Constant.Builder(getX())
            .setValue(this.getDestinationUser())
            .build())
          .build();
      `,
      hidden: true
    },
    {
      name: 'ruleGroup',
      value: 'restrictUsersRules',
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
        Logger logger = (Logger) getX().get("logger");
        if ( logger != null ) {
          logger.warning(this.getId() + " restricting operation. " + this.getDescription());
        }
        return new ExceptionRuleAction.Builder(getX()).setMessage("Operation prevented by business rule: " + this.getId()).build(); // <- seen by users
      `
    }
  ]
});
