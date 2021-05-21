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
  name: 'L2TransactionApprovalRule',
  extends: 'net.nanopay.liquidity.tx.BusinessRule',

  imports: [
    'accountDAO',
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.ruler.predicate.PropertyEQValue',
    'net.nanopay.liquidity.ruler.AccountTemplateContains',
    'net.nanopay.liquidity.ruler.ApprovalRuleActionOnCreate',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*',
  ],

  searchColumns: [
    'id',
    'name',
    'startAmount'
  ],

  properties: [
    { name: 'name' },
    { name: 'description' },
    {
      name: 'ruleGroup',
      hidden: true,
      value: 'txapprovals'
    },
    {
      name: 'priority',
      documentation: 'Prioritize account-based rules over account group-based rules.',
      javaGetter: `
        return getUseAccountTemplate() ? 80 : 90;
      `
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dao.Operation',
      name: 'operation',
      value: 'UPDATE',
      visibility: 'RO',
    },
    {
      name: 'after',
      value: true
    },
    {
      class: 'Boolean',
      name: 'useAccountTemplate',
      label: 'Use Account Group',
      documentation: 'Use account group instead of source account if set to true.',
      section: 'basicInfo',
      postSet: function(o, n) {
        if ( o ) {
          this.clearProperty('accountTemplate');
          this.clearProperty('denomination');
        } else if ( n ) {
          this.clearProperty('sourceAccount');
        }
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      label: 'Apply To Account',
      section: 'basicInfo',
      targetDAOKey: 'accountDAO',
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
      visibility: function(useAccountTemplate) {
        return ! useAccountTemplate ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      postSet: function(_, nu) {
        if ( ! this.useAccountTemplate && !! nu && this.accountDAO ) {
          this.accountDAO.find(nu).then((account)=>{
            if ( account ) {
              this.denomination = account.denomination;
            }
          });
        }
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.crunch.AccountTemplate',
      name: 'accountTemplate',
      label: 'Apply To Account Group',
      section: 'basicInfo',
      visibility: function(useAccountTemplate) {
        return useAccountTemplate ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'denomination',
      targetDAOKey: 'currencyDAO',
      documentation: 'The denomination to apply to when using account group.',
      label: 'Apply To Denomination',
      section: 'basicInfo',
      visibility: function(useAccountTemplate) {
        return useAccountTemplate ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              dao: X.currencyDAO,
              heading: 'Currencies'
            }
          ]
        };
      }
    },
    {
      class: 'UnitValue',
      name: 'startAmount',
      label: 'Apply to Transactions Larger Than',
      section: 'basicInfo',
      validationPredicates: [
        {
          args: ['startAmount'],
          predicateFactory: function(e) {
            return e.GT(net.nanopay.liquidity.tx.L2TransactionApprovalRule.START_AMOUNT, 0);
          },
          errorString: 'Amount must be greater than 0.'
        }
      ],
      view: { class: 'foam.u2.view.CurrencyInputView', contingentProperty: 'denomination' }
    },
    {
      name: 'predicate',
      transient: true,
      javaGetter: `
        Predicate accountPredicate = EQ(DOT(NEW_OBJ, Transaction.SOURCE_ACCOUNT), getSourceAccount());
        Predicate denominationPredicate = TRUE;
        if ( getUseAccountTemplate() ) {
          accountPredicate = new AccountTemplateContains.Builder(getX())
            .setAccountProperty(Transaction.SOURCE_ACCOUNT)
            .setAccountTemplate(getAccountTemplate())
            .build();
          denominationPredicate = EQ(DOT(NEW_OBJ, Transaction.SOURCE_CURRENCY), getDenomination());
        }

        return AND(
          new PropertyEQValue.Builder(getX())
            .setPropName("lifecycleState")
            .setPropValue(LifecycleState.PENDING)
            .build(),
          denominationPredicate,
          accountPredicate,
          GTE( DOT(NEW_OBJ, Transaction.AMOUNT), getStartAmount() )
        );
      `
    },
    {
      name: 'asyncAction',
      transient: true,
      javaGetter: `
        return new ApprovalRuleActionOnCreate.Builder(getX())
          .setApproverLevel(2)
          .build();
      `,
    }
  ]
});
