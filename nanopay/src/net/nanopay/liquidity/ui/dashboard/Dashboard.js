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
  package: 'net.nanopay.liquidity.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.layout.Card',
    'foam.u2.layout.Grid',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.comics.v2.DAOBrowserView',
    'net.nanopay.liquidity.ui.dashboard.accounts.DashboardAccounts',
    'net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposureDAO',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure',
    'net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity',
  ],

  imports: [
    'accountBalanceWeeklyCandlestickDAO as accountBalancesOverTime',
    'liquidityThresholdWeeklyCandlestickDAO',
    'transactionDAO',
    'accountDAO'
  ],

  exports: [
    'filteredAccountDAO',
    'liquidityFilteredAccountDAO'
  ],

  css: `
    ^header-container {
      padding: 32px 32px 0px 32px;
    }

    ^header {
      font-size: 36px;
      font-weight: 600;
      line-height: 1.33;
    }

    ^last-updated {
      margin-left: 24px;
    }

    ^dashboard-container {
      grid-column-gap: 16px;
      grid-row-gap: 32px;
      padding: 32px;
    }

    ^ .foam-u2-ActionView-refresh span {
      vertical-align: middle;
    }

    ^ .foam-u2-layout-Card {
      overflow-x: auto;
    }

    ^ .foam-u2-view-RichChoiceView {
      width: 100%;
      z-index: 3;
    }

    ^ .foam-u2-view-RichChoiceView-selection-view:hover {
      cursor: pointer;
    }

    ^ .foam-u2-view-RichChoiceView .search {
      padding: 8px 16px;
      font-size: 14px;
      border-bottom: 1px solid #f4f4f9;
    }

    ^ .foam-u2-view-RichChoiceView-heading {
      border-bottom: 1px solid #f4f4f9;
      line-height: 24px;
      font-size: 14px;
      color: #333;
      font-weight: 900;
      padding: 6px 16px;
    }

    ^ .DefaultRowView-row {
      padding: 8px 16px;
      color: #424242;
    }

    ^ .disclaimer {
      margin: 0;
      margin-top: 8px;
      font-size: 12px;
      font-style: italic;
    }
  `,

  properties: [
    {
      class: 'DateTime',
      name: 'lastUpdated',
      factory: function() {
        return new Date();
      }
    },
    {
      name: 'filteredAccountDAO',
      expression: function(accountDAO){
        return accountDAO.where(
          this.NOT(
            this.OR(
              this.INSTANCE_OF(net.nanopay.account.ShadowAccount),
              this.INSTANCE_OF(net.nanopay.bank.BankAccount)
            )
          )
        )
      }
    },
    {
      name: 'liquidityFilteredAccountDAO',
      expression: function(accountDAO){
        return accountDAO.where(
          this.AND(
            foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' }),
            this.EQ(net.nanopay.account.Account.LIFECYCLE_STATE, foam.nanos.auth.LifecycleState.ACTIVE),
            this.EQ(net.nanopay.account.Account.IS_DEFAULT, false)
          )
        );
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'currencyExposureDAO',
      expression: function(lastUpdated, filteredAccountDAO) {
        return this.CurrencyExposureDAO.create();
      },
    }
  ],

  messages: [
    {
      name: 'UPDATED',
      message: 'Last updated at',
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
          .start(this.Cols).addClass(this.myClass('header-container'))
            .start(this.Cols).style({'align-items': 'baseline'})
              .start().add(this.cls_.name).addClass(this.myClass('header')).end()
              .start()
                .add(this.lastUpdated$.map(v => `${this.UPDATED}: ${v.toLocaleString(foam.locale)}`))
                .addClass(this.myClass('last-updated'))
              .end()
            .end()
            .startContext({data: this})
              .tag(this.REFRESH, { icon: 'images/refresh-icon.svg' })
            .endContext()
          .end()
          .tag(this.lastUpdated$.map(_ => {
            return this.Grid.create()
              .addClass(this.myClass('dashboard-container'))
              .start(this.Card, { columns: 7 }).addClass(this.myClass('accounts'))
                .tag(this.DashboardAccounts, {
                  currency: this.currencyExposureDAO$proxy
                })
              .end()
              .start(this.Card, { columns: 5 }).addClass(this.myClass('liquidity'))
                .tag(this.DashboardLiquidity)
              .end()
              .start(this.Card, { columns: 4 }).addClass(this.myClass('currency-exposure'))
                .tag(this.DashboardCurrencyExposure, { data: this.currencyExposureDAO$proxy })
              .end()
              .start(this.Card, { columns: 8 })
                .tag(this.DashboardCicoShadow)
              .end()
          }))
    }
  ],
  actions: [
    {
      name: 'refresh',
      code: function() {
        this.lastUpdated = undefined;
      }
    },
  ]
});
