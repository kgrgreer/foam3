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
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',

  imports: [
    'ruleDAO?'
  ],

  requires: [
    'net.nanopay.liquidity.tx.TxLimitRule',
    'net.nanopay.liquidity.tx.TxLimitEntityType'
  ],

  messages: [
    { name: 'TRANSACTION_LIMITS_MSG', message: 'Transaction Limits for' }
  ],

  actions: [
    {
      name: 'viewTransactionLimits',
      section: 'operationsInformation',
      availablePermissions: ['foam.nanos.auth.User.permission.viewTransactionLimit'],
      code: async function() {
        var m = foam.mlang.ExpressionsSingleton.create();
        var accountIds = await this.accounts
          .select(m.MAP(net.nanopay.account.Account.ID))
          .then((sink) => sink.delegate.array);
        var predicates = [];
        if ( this.cls_ === foam.nanos.auth.User ) {
          predicates.push(
            m.AND(
              m.EQ(this.TxLimitRule.APPLY_LIMIT_TO, this.TxLimitEntityType.USER),
              m.EQ(this.TxLimitRule.USER_TO_LIMIT, this.id)
            )
          );
        }
        else if ( net.nanopay.model.Business.isInstance(this) ) {
          predicates.push(
            m.AND(
              m.EQ(this.TxLimitRule.APPLY_LIMIT_TO, this.TxLimitEntityType.BUSINESS),
              m.EQ(this.TxLimitRule.BUSINESS_TO_LIMIT, this.id)
            )
          );
        }
        if ( accountIds.length > 0 ) {
          predicates.push(
            m.AND(
              m.EQ(this.TxLimitRule.APPLY_LIMIT_TO, this.TxLimitEntityType.ACCOUNT),
              m.IN(this.TxLimitRule.ACCOUNT_TO_LIMIT, accountIds)
            )
          );
        }

        var dao = this.ruleDAO.where(
          m.AND(
            m.INSTANCE_OF(this.TxLimitRule),
            predicates.length > 0
              ? m.OR(...predicates)
              : m.FALSE
          )
        );
        dao.of = this.TxLimitRule;
        this.__context__.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            browseTitle: `${this.TRANSACTION_LIMITS_MSG} ${this.toSummary()}`
          }
        });
      }
    }
  ]
});
