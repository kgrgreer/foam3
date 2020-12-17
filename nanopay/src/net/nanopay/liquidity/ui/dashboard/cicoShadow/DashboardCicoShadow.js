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
  package: 'net.nanopay.liquidity.ui.dashboard.cicoShadow',
  name: 'DashboardCicoShadow',
  extends: 'foam.u2.Element',
  documentation: 'Displays a horizontal bar graph for the cash flow of shadow accounts',

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
  ^ {
    padding: 32px 16px;
  }

  ^ .property-account {
    display: inline-block;
    min-width: 360px;
  }

  ^ .property-timeFrame {
    display: inline-block;
  }

  ^ .property-endDate {
    padding: 0;
  }

  ^card-header-title {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  ^ .foam-u2-tag-Select {
    margin-left: 16px;
  }

  ^chart {
    margin-top: 32px;
  }
`,

  requires: [
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.analytics.Candlestick',
    'net.nanopay.account.ShadowAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadowChart',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.glang.EndOfWeek',
    'foam.glang.EndOfDay',
    'foam.mlang.IdentityExpr',
    'foam.u2.detail.SectionedDetailPropertyView',
    'net.nanopay.liquidity.ui.dashboard.cicoShadow.TransactionCICOType',
    'net.nanopay.liquidity.ui.dashboard.DateFrequency'
  ],

  imports: [
    'accountDAO',
    'transactionDAO',
    'currencyDAO'
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'CASH IN / OUT OF SHADOW ACCOUNTS',
    },
    {
      name: 'TOOLTIP_TOTAL_CI',
      message: '+'
    },
    {
      name: 'TOOLTIP_TOTAL_CO',
      message: '−'
    },
    {
      name: 'LABEL_DISCLAIMER',
      message: 'A future date will not be reflected on the graph'
    }
  ],

  properties: [
    {
      class: 'Date',
      name: 'startDate',
      expression: function(endDate, timeFrame) {
        var startDate = endDate;
        for ( var i = 0 ; i < timeFrame.numLineGraphPoints ; i++ ) {
          startDate = timeFrame.startExpr.f(new Date(startDate.getTime() - 1));
        }
        return startDate;
      },
      preSet: function(o, n) {
        return n > new Date() ? o : n;
      },
      postSet: function(_, n) {
        var endDate = n || new Date();
        for ( var i = 0 ; i < this.timeFrame.numBarGraphPoints ; i++ ) {
          endDate = this.timeFrame.endExpr.f(new Date(endDate.getTime() + 1));
        }
        this.endDate = endDate;
      }
    },
    {
      class: 'Date',
      name: 'endDate',
      visibility: 'RO',
      view: { class: 'foam.u2.DateView' }, // Override ModeAltView
      factory: function() { return new Date(); },
      preSet: function(o, n) {
        n = n || new Date();
        if ( n > new Date() ) return o;
        return this.timeFrame.endExpr.f(n.getTime() > Date.now() ? new Date() : n);
      }
    },
    {
      class: 'Map',
      name: 'config',
      factory: function () {
        var self = this;
        return {
          type: 'horizontalBar',
          options: {
            legend: {
              display: false
            },
            elements: {
              rectangle: {
                borderWidth: 2,
              }
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    // convert to millions
                    callback: function (value, index, values) {
                      const dateArray = value.toLocaleDateString('en-US').split('/');
                      const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ];
                      const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

                      switch (self.timeFrame) {
                        case net.nanopay.liquidity.ui.dashboard.DateFrequency.MONTHLY:
                          return `${monthNames[Number.parseInt(dateArray[0] - 1)]} ${dateArray[2]}`

                        case net.nanopay.liquidity.ui.dashboard.DateFrequency.QUARTERLY:
                          return `${quarterNames[Number.parseInt(dateArray[0]) / 3 - 1]} ${dateArray[2]}`

                        case net.nanopay.liquidity.ui.dashboard.DateFrequency.ANNUALLY:
                          return dateArray[2];

                        default:
                          return value.toLocaleDateString('en-US');
                      }
                    }
                  }
                }
              ],
            }
          },
        };
      }
    },
    {
      class: 'Map',
      name: 'customDatasetStyling',
      documentation: `
        Property map that would hold the customization for each key type
        1. Key must equal the candlestick's key.
        2. Value mapped with key must be a 1:1 mapping defined in chartjs.org's documentation.
      `,
      factory: function(){
        return {
          CITransaction: {
            backgroundColor: '#b8e5b3'
          },
          COTransaction: {
            backgroundColor: '#f79393'
          }
        }
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'Accounts',
              dao: X.data.shadowAccountDAO
            },
          ],
          search: true,
          searchPlaceholder: 'Search...'
        };
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'shadowAccountDAO',
      documentation: `
        A predicatedAccountDAO which only pulls shadow accounts
      `,
      expression: function () {
        return this.accountDAO.where(this.INSTANCE_OF(this.ShadowAccount));
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'cicoTransactionsDAO',
      documentation: `
      DAO for recent transactions in entire ecosystem
    `,
      expression: function (account, startDate, endDate) {
        return this.transactionDAO.where(
          this.AND(
            this.AND(
              this.GTE(net.nanopay.tx.model.Transaction.LAST_MODIFIED, startDate),
              this.LTE(net.nanopay.tx.model.Transaction.LAST_MODIFIED, endDate)
            ),
            this.EQ(this.Transaction.STATUS, this.TransactionStatus.COMPLETED),
            this.OR(
              this.AND(
                this.INSTANCE_OF(net.nanopay.tx.cico.CITransaction),
                this.EQ(this.Transaction.DESTINATION_ACCOUNT, account)
              ),
              this.AND(
                this.INSTANCE_OF(net.nanopay.tx.cico.COTransaction),
                this.EQ(this.Transaction.SOURCE_ACCOUNT, account)
              )
            )
          )
        );
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.ui.dashboard.DateFrequency',
      name: 'timeFrame',
      value: 'WEEKLY'
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.addClass(this.myClass())
        .start(this.Cols)
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header-title')).end()
          .startContext({ data: this })
            .start(this.Cols).addClass(this.myClass('buttons'))
              .start().add(this.ACCOUNT).end()
              .start().add(this.TIME_FRAME).end()
            .end()
          .endContext()
        .end()
        .start().style({ 'height': '320px' }).addClass(self.myClass('chart'))
          .add(this.slot(function(account, currencyDAO, config, customDatasetStyling) {
            return (account ? self.account$find : Promise.resolve(null))
              .then(a => a && currencyDAO.find(a.denomination))
              .then(c => {
                if ( c ) {
                  config = foam.Object.clone(config);
                  config.options.scales.xAxes = [{
                    ticks: {
                      beginAtZero:true,
                      // min: 0,
                      callback: function (value) {
                        return `${c.format(value)}`;
                      }
                    }
                  }];
                  config.options.tooltips = {
                    callbacks: {
                      label: function(tooltipItem, data) {
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        var currentValue = dataset.data[tooltipItem.index];

                        var label = dataset.label === 'CITransaction' ? self.TOOLTIP_TOTAL_CI : self.TOOLTIP_TOTAL_CO;
                        return [`${label} ${c.format(currentValue)}`];
                      }
                    }
                  };
                }
                return self.DashboardCicoShadowChart.create({
                  data$: self.cicoTransactionsDAO$,
                  keyExpr: self.TransactionCICOType.create(),
                  config: config,
                  xExpr: net.nanopay.tx.model.Transaction.AMOUNT,
                  yExpr$: self.timeFrame$.map(d => d.endExpr.clone().copyFrom({
                    delegate: net.nanopay.tx.model.Transaction.LAST_MODIFIED
                  })),
                  customDatasetStyling: customDatasetStyling
                });
              })
            }))
        .end()
        .startContext({ data: this })
          .start(this.Cols).addClass(this.myClass('buttons'))
            .tag(this.SectionedDetailPropertyView, {
              data: this,
              prop: this.START_DATE
            })
            .tag(this.SectionedDetailPropertyView, {
              data: this,
              prop: this.END_DATE
            })
          .end()
        .endContext()
        .start('p').addClass('disclaimer').add(this.LABEL_DISCLAIMER).end();
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.cicoShadow',
  name: 'TransactionCICOType',
  extends: 'foam.mlang.AbstractExpr',
  implements: ['foam.core.Serializable'],

  requires: [
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction'
  ],

  javaImports: [
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction'
  ],

  methods: [
    {
      name: 'f',
      code: function (obj) {
        return this.CITransaction.isInstance(obj)
          ? 'CITransaction'
          : this.COTransaction.isInstance(obj)
            ? 'COTransaction'
            : 'Other';
      },
      javaCode: `
        return obj instanceof CITransaction
          ? "CITransaction"
          : obj instanceof COTransaction
            ? "COTransaction"
            : "Other";
      `
    }
  ]
});
