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
  name: 'DebtAccount',
  extends: 'net.nanopay.account.DigitalAccount',
  documentation: 'Account which captures a debt obligation, the creditor, and the debtor.',

  implements: [
      'foam.mlang.Expressions',
  ],

  requires: [
  'net.nanopay.account.OverdraftAccount',
  'net.nanopay.account.ZeroAccount',
  'net.nanopay.account.Account'
  ],

  imports: [
    'stack'
  ],

  properties: [
    // name: 'terms' - future - capture the repayment, interest, ...
    {
      name: 'debtorAccount',
      label: 'Debtor',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      targetDAOKey:'localAccountDAO',
      documentation: 'The account which owes this debt.',
      visibility: 'RO',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO.where(
             X.data.INSTANCE_OF(X.data.OverdraftAccount)
          ),
          placeholder: '--',
          objToChoice: function(debtorAccount) {
            return [debtorAccount.id, debtorAccount.name];
          }
        });
      }
    },
    {
      name: 'creditorAccount',
      label: 'Creditor',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'The account which is owned this debt.',
      targetDAOKey: 'localAccountDAO',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO.where(
            X.data.AND(
              X.data.NOT(X.data.INSTANCE_OF(X.data.ZeroAccount))
            )
          ),
          placeholder: '--',
          objToChoice: function(creditorAccount) {
            return [creditorAccount.id, creditorAccount.name];
          }
        });
      }
    },
    {
      class: 'Long',
      name: 'limit',
      value: 0
    }
  ],

  methods: [
    {
      documentation: 'Debt account is always negative',
      name: 'validateAmount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ],
      javaCode: `
      long bal = balance == null ? 0L : balance.getBalance();
        if ( amount > 0 &&
             amount > -bal ||
             amount < 0 &&
             amount + bal < -this.getLimit() ) {
              throw new RuntimeException("Invalid transfer, "+this.getClass().getSimpleName()+" account balance must remain between ["+this.getLimit()+", 0]" + this.getClass().getSimpleName()+"."+getName()+ "would be... "+ amount + bal) ;
        }
      `
    }
  ],

  actions: [
    {
      name: 'viewExposure',
      isAvailable: function() {
        if (this.stack.top[0].class == 'net.nanopay.tx.ui.exposure.ExposureOverview') {
          return false;
        }
        return true;
      },
      code: async function(X) {
        var creditorAccount = await this.accountDAO.find(this.creditorAccount);
        X.stack.push({ class: 'net.nanopay.tx.ui.exposure.ExposureOverview', data: creditorAccount });
      }
    }
  ]
});
