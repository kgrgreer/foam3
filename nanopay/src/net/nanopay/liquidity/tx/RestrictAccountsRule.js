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
  name: 'RestrictAccountsRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',

  documentation: 'Prevents specified accounts from transacting.',

  javaImports: [
    'net.nanopay.liquidity.tx.*',
    'foam.mlang.*',
    'foam.mlang.expr.*',
    'foam.mlang.predicate.*',
    'foam.mlang.MLang.*',
    'net.nanopay.account.Account',
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
    'createdBy'
  ],

  properties: [
    { name: 'name' },
    { name: 'description' },
    {
      class: 'Reference',
      name: 'sourceAccount',
      section: 'basicInfo',
      targetDAOKey: 'accountDAO',
      of: 'net.nanopay.account.Account',
      view: function(_, X) {
        const e = foam.mlang.Expressions.create();
        const Account = net.nanopay.account.Account;
        const LifecycleState = foam.nanos.auth.LifecycleState;
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Accounts',
              dao: X.accountDAO
                .where(
                  e.AND(
                    e.EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
                    foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' })
                  )
                )
                .orderBy(Account.NAME)
            }
          ]
        };
      },
      tableCellFormatter: function(value) {
        var self = this;
        this.__subSubContext__.accountDAO.find(value).then((account)=> {
          account.name ? self.add(account.name) : self.add(account.id);
        });
      },
      validationPredicates: [
        {
          args: ['sourceAccount'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.liquidity.tx.RestrictAccountsRule.SOURCE_ACCOUNT, 0);
          },
          errorString: 'Source account must be set.'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'includeSourceChildAccounts',
      label: 'Include Source Sub-Accounts',
      documentation: 'Whether to include the children of the source account.',
      section: 'basicInfo'
    },
    {
      class: 'Reference',
      name: 'destinationAccount',
      section: 'basicInfo',
      targetDAOKey: 'accountDAO',
      of: 'net.nanopay.account.Account',
      view: function(_, X) {
        const e = foam.mlang.Expressions.create();
        const Account = net.nanopay.account.Account;
        const LifecycleState = foam.nanos.auth.LifecycleState;
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Accounts',
              dao: X.accountDAO
                .where(
                  e.AND(
                    e.EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
                    foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' })
                  )
                )
                .orderBy(Account.NAME)
            }
          ]
        };
      },
      tableCellFormatter: function(value) {
        var self = this;
        this.__subSubContext__.accountDAO.find(value).then((account)=> {
          account.name ? self.add(account.name) : self.add(account.id);
        });
      },
      validationPredicates: [
        {
          args: ['destinationAccount'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.liquidity.tx.RestrictAccountsRule.DESTINATION_ACCOUNT, 0);
          },
          errorString: 'Destination account must be set.'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'includeDestinationChildAccounts',
      label: 'Include Destination Sub-Accounts',
      documentation: 'Whether to include the children of the destination account.',
      section: 'basicInfo'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'sourcePredicate',
      expression: function(sourceAccount) {
        var expr = this.PropertyExpr.create({
          of: 'net.nanopay.account.Account',
          property: this.Account.ID
        });
        var cons = this.Constant.create({
          value: sourceAccount
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
            .setOf(Account.getOwnClassInfo())
            .setProperty(Account.ID)
            .build())
          .setArg2(new Constant.Builder(getX())
            .setValue(this.getSourceAccount())
            .build())
          .build();
      `,
      hidden: true
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'destinationPredicate',
      expression: function(destinationAccount) {
        var expr = this.PropertyExpr.create({
          of: 'net.nanopay.account.Account',
          property: this.Account.ID
        });
        var cons = this.Constant.create({
          value: destinationAccount
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
            .setOf(Account.getOwnClassInfo())
            .setProperty(Account.ID)
            .build())
          .setArg2(new Constant.Builder(getX())
            .setValue(this.getDestinationAccount())
            .build())
          .build();
      `,
      hidden: true
    },
    {
      name: 'ruleGroup',
      value: 'restrictAccountsRules',
      hidden: true
    },
    {
      name: 'predicate',
      transient: true,
      hidden: true,
      javaGetter: `
        return foam.mlang.MLang.AND(
          (new BusinessRuleTransactionPredicate.Builder(getX()))
            .setIsSourcePredicate(true)
            .setIncludeChildAccounts(this.getIncludeSourceChildAccounts())
            .setParentId(this.getSourceAccount())
            .setPredicate(this.getSourcePredicate())
            .build(),
          (new BusinessRuleTransactionPredicate.Builder(getX()))
            .setIsSourcePredicate(false)
            .setIncludeChildAccounts(this.getIncludeDestinationChildAccounts())
            .setParentId(this.getDestinationAccount())
            .setPredicate(this.getDestinationPredicate())
            .build()
        );
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
        return new ExceptionRuleAction.Builder(getX()).setMessage("Operation prevented by business rule: " + this.getName()).build(); // <- seen by users
      `
    }
  ]
});
