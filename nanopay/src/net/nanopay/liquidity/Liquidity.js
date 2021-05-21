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
  package: 'net.nanopay.liquidity',
  name: 'Liquidity',

  requires: [
    'foam.core.Currency',
    'foam.u2.TextField',
    'foam.u2.view.ValueView',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount'
  ],

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.auth.EnabledAware'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Determines whether Liquidity is active, and notifications and/or re-balancing is to occur',
      value: true
    },
    {
      class: 'Boolean',
      name: 'rebalancingEnabled',
      label: 'Automate Sweep',
      documentation: 'Triggers automatic transaction on accounts.'
    },
    {
      visibility: 'hidden',
      class: 'Reference',
      of: 'foam.core.Unit',
      name: 'denomination',
      targetDAOKey: 'currencyDAO',
      storageTransient: true
    },
    {
      class: 'UnitValue',
      unitPropName: 'denomination',
      name: 'threshold',
      documentation: 'The balance when liquidity should be triggered.',
      view: { class: 'foam.u2.view.CurrencyInputView', contingentProperty: 'denomination' }
    },
    {
      class: 'UnitValue',
      unitPropName: 'denomination',
      name: 'resetBalance',
      label: 'Reset balance to',
      documentation: 'Account balance must match reset amount after liquidity transaction was generated.',
      view: { class: 'foam.u2.view.CurrencyInputView', contingentProperty: 'denomination' }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'pushPullAccount',
      label: 'Rebalancing Account',
      documentation: 'Account associated to setting.',
      tableCellFormatter: function(value, obj, axiom) {
        obj.pushPullAccount$find.then((account) => {
          this.add(account.toSummary());
        }).catch(() => {
          this.add(value);
        });
      },
      view: {
        class: 'foam.u2.view.ModeAltView',
        readView: { class: 'foam.u2.view.TableCellFormatterReadView' },
        writeView: function(_, X) {
          const Account = net.nanopay.account.Account;
          const LifecycleState = foam.nanos.auth.LifecycleState;
          var dao = foam.dao.ProxyDAO.create({
            delegate: X.accountDAO.where(
              X.data.AND(
                X.data.EQ(
                  net.nanopay.account.Account.DENOMINATION,
                  X.denominationToFilterBySlot ? X.denominationToFilterBySlot.get() : X.data.denomination
                ),
                X.data.NOT(X.data.INSTANCE_OF(net.nanopay.account.AggregateAccount)),
                X.data.EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE)
              )
            )
          });

          if ( foam.core.Slot.isInstance(X.denominationToFilterBySlot) ) {
            this.onDetach(X.denominationToFilterBySlot.sub(function() {
              dao.delegate = X.accountDAO.where(
                X.data.AND(
                  X.data.EQ(
                    net.nanopay.account.Account.DENOMINATION,
                    X.denominationToFilterBySlot.get()
                  ),
                  X.data.NOT(X.data.INSTANCE_OF(net.nanopay.account.AggregateAccount)),
                  X.data.NOT(X.data.INSTANCE_OF(net.nanopay.account.SecuritiesAccount))
                )
              );
            }));
          }

          return foam.u2.view.RichChoiceView.create({
            search: true,
            choosePlaceholder: 'Select a denomination then choose from accounts...',
            sections: [
              { dao: dao }
            ]
          }, X);
        }
      }
    }
  ]
});
