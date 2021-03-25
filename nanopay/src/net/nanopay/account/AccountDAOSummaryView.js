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

/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOSummaryView',
  extends: 'foam.comics.v2.DAOSummaryView',

  requires: [
    'net.nanopay.account.AccountDAOSummaryViewView'
  ],

  documentation: `
    A configurable summary view for a specific instance
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewView',
      factory: function() {
        const { data } = this;
        return this.AccountDAOSummaryViewView.create({ data });
      }
    }
  ],
});

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOSummaryViewView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A configurable summary view for a specific instance
  `,

  css:`
    ^ .foam-u2-ActionView-back {
      display: flex;
      align-self: flex-start;
    }

    ^actions-header .foam-u2-ActionView {
      margin-right: 24px;
      line-height: 1.5
    }

    ^table-header {
      padding: 32px 0px 12px 16px;
      font-weight: 600;
      font-size: 12px;
    }

    ^card-header {
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 24px;
    }

    ^transactions-table {
      margin: 32px 0px;
    }

    ^card-row {
      margin-top: 32px;
      grid-column-gap: 16px;
      grid-row-gap: 32px;
    }

    ^card-row .foam-u2-layout-Card {
      padding: 24px 16px;
    }

    ^threshold-header {
      margin-top: 60px;
    }
  `,

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.borders.CardBorder',
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Card',
    'foam.u2.layout.GUnit',
    'foam.u2.layout.Grid',
    'foam.u2.layout.Rows',
    'net.nanopay.account.AccountBalanceView',
    'net.nanopay.account.AggregateAccount'
  ],
  imports: [
    'transactionDAO',
    'liquiditySettingsDAO'
  ],

  messages: [
    {
      name: 'TABLE_HEADER',
      message: 'TRANSACTIONS'
    },
    {
      name: 'OVERVIEW_HEADER',
      message: 'OVERVIEW'
    },
    {
      name: 'THRESHOLD_HEADER',
      message: 'THRESHOLD RULES'
    },
    {
      name: 'NO_LIQUIDITY_SETTINGS',
      message: 'No liquidity threshold rules have been set for this account.'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(self.slot(function(data, data$id) {
          return self.E()
            .start(self.Grid).addClass(this.myClass('card-row'))
              .start(self.Card, { columns: this.data.liquiditySetting !== undefined ? 4 : 6 })
                .tag(self.AccountBalanceView, { data })
              .end()
              .start(self.Card, { columns: this.data.liquiditySetting !== undefined ? 4 : 6 })
                .start().add(self.OVERVIEW_HEADER).addClass(this.myClass('card-header')).end()
                .tag(self.SectionView, {
                  data,
                  section: {
                    properties: [
                      data.CREATED.clone().copyFrom({
                        gridColumns: 6
                      }),
                      data.CREATED_BY.clone().copyFrom({
                        gridColumns: 6
                      }),
                      data.TYPE.clone().copyFrom({
                        gridColumns: 6
                      }),
                      data.ID.clone().copyFrom({
                        gridColumns: 6
                      })
                    ]
                  }
                })
              .end()
              .callIf(data.liquiditySetting !== undefined, function() {
                this.start(self.Card, { columns: 4 })
                  .start().add(self.THRESHOLD_HEADER).addClass(self.myClass('card-header')).end()
                  .callIfElse(data.liquiditySetting === 0, function() {
                    this.start().add(self.NO_LIQUIDITY_SETTINGS).addClass(self.myClass('threshold-header')).end();
                  }, function() {
                    this
                      .add(data.liquiditySetting$find.then(ls => {
                        return self.E()
                          .callIf(ls.lowLiquidity.enabled, function(){
                            this
                              .tag(self.SectionView, {
                                data: ls.lowLiquidity,
                                section: {
                                  properties: [
                                    ls.lowLiquidity.THRESHOLD.clone().copyFrom({
                                      label: 'Low',
                                      gridColumns: 4,
                                      view: {
                                        class: 'foam.u2.view.CurrencyInputView',
                                        contingentProperty: 'denomination',
                                        shortenToPrecision: 1
                                      }
                                    }),
                                    ls.lowLiquidity.RESET_BALANCE.clone().copyFrom({
                                      label: 'Reset balance to',
                                      gridColumns: 4,
                                      view: {
                                        class: 'foam.u2.view.CurrencyInputView',
                                        contingentProperty: 'denomination',
                                        shortenToPrecision: 1
                                      }
                                    }),
                                    ls.lowLiquidity.PUSH_PULL_ACCOUNT.clone().copyFrom({
                                      label: 'With funding from',
                                      gridColumns: 4
                                    })
                                  ]
                                }
                              })
                            })
                            .callIf(ls.highLiquidity.enabled, function(){
                              this.tag(self.SectionView, {
                                data: ls.highLiquidity,
                                section: {
                                  properties: [
                                    ls.highLiquidity.THRESHOLD.clone().copyFrom({
                                      label: 'High',
                                      gridColumns: 4,
                                      view: {
                                        class: 'foam.u2.view.CurrencyInputView',
                                        contingentProperty: 'denomination',
                                        shortenToPrecision: 1
                                      }
                                    }),
                                    ls.highLiquidity.RESET_BALANCE.clone().copyFrom({
                                      label: 'Reset balance to',
                                      gridColumns: 4,
                                      view: {
                                        class: 'foam.u2.view.CurrencyInputView',
                                        contingentProperty: 'denomination',
                                        shortenToPrecision: 1
                                      }
                                    }),
                                    ls.highLiquidity.PUSH_PULL_ACCOUNT.clone().copyFrom({
                                      label: 'With excess to',
                                      gridColumns: 4
                                    })
                                  ]
                                }
                              })
                            })
                          })
                        )
                      })
                    .end()
                  })
                .end()
            .callIf(! self.AggregateAccount.isInstance(self.data), function() {
              this
                .start(self.CardBorder).addClass(self.myClass('transactions-table'))
                  .start().add(self.TABLE_HEADER).addClass(self.myClass('table-header')).end()
                  .start(foam.comics.v2.DAOBrowserView, {
                    config: self.DAOControllerConfig.create({
                      editEnabled: false,
                      deleteEnabled: false,
                      dao: self.transactionDAO
                      .where(
                        self.AND(
                          self.OR
                          (
                            self.EQ(
                              net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, data$id
                            ),
                            self.EQ(
                              net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT, data$id
                            )
                          ),
                          self.EQ(
                            net.nanopay.tx.model.Transaction.LIFECYCLE_STATE, foam.nanos.auth.LifecycleState.ACTIVE
                          )
                        )
                      )
                      .orderBy(self.DESC(net.nanopay.tx.model.Transaction.CREATED))
                      .limit(20),
                      defaultColumns: [
                        "summary",
                        "lastModified",
                        "sourceAccount",
                        "destinationAccount",
                        "destinationCurrency",
                        "destinationAmount"
                      ]
                    }),
                  })
                  .end()
                .end();
            })
        }));
    }
  ]
});
