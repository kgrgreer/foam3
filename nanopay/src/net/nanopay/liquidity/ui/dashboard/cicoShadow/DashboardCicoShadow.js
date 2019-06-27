foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.cicoShadow',
  name: 'DashboardCicoShadow',
  extends: 'foam.u2.Element',
  description: 'Displays a horizontal bar graph for the cash flow of shadow accounts',

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
  ^ {
    padding: 32px 16px;
  }

  ^ .property-account {
    display: inline-block;
  }

  ^ .property-timeFrame {
    display: inline-block;
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

  ^shifter {
    margin: 36px 0;
    padding: 0px 16px;
  }

  ^ .foam-u2-ActionView img {
    margin-right: 0;
  }

  ^ .foam-u2-ActionView-secondary:disabled {
    opacity: 0.4;
  }
`,

  requires: [
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.analytics.Candlestick',
    'net.nanopay.account.ShadowAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'org.chartjs.HorizontalBarDAOChartView',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols'
  ],

  exports: [
    'shadowAccountDAO'
  ],
  imports: [
    'accountDAO',
    'transactionDAO'
  ],

  messages: [
    {
      name: 'TIMEFRAME_WEEKLY',
      message: 'Weekly'
    },
    {
      name: 'TIMEFRAME_MONTHLY',
      message: 'Monthly'
    },
    {
      name: 'TIMEFRAME_QUARTERLY',
      message: 'Quarterly'
    },
    {
      name: 'TIMEFRAME_ANNUALLY',
      message: 'Annually'
    },
    {
      name: 'LABEL_MILLIONS',
      message: 'Millions'
    },
    {
      name: 'CARD_HEADER',
      message: 'CASH IN / OUT OF SHADOW ACCOUNTS',
    }
  ],

  properties: [
    {
      class: 'Int',
      name: 'yItemsLimit',
      value: 3
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      targetDAOKey: 'shadowAccountDAO',
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
      expression: function (account) {
        return this.transactionDAO.where(
          this.TRUE
          // this.AND(
          //   //this.GT(this.Transaction.completionDate,start),
          //   //this.LT(this.Transaction.completionDate,end),
          //   this.EQ(this.Transaction.STATUS, this.TransactionStatus.COMPLETED),
          //   this.OR(
          //     this.AND(
          //       this.INSTANCE_OF(this.CITransaction),
          //       this.EQ(this.Transaction.DESTINATION_ACCOUNT, account)
          //     ),
          //     this.AND(
          //       this.INSTANCE_OF(this.COTransaction),
          //       this.EQ(this.Transaction.SOURCE_ACCOUNT, account)
          //     )
          //   )
          // )
        );
      }
    },
    {
      class: 'Map',
      name: 'config',
      factory: function() {
        var self = this;
        return {
          type: 'horizontalBar',
          data: {
            labels: [ 'test1', 'test2', 'tings'],
            datasets: [
              {
                label: 'Dataset 1',
                backgroundColor: '#b8e5b3',
                data: [
                  0.4,
                  0.3,
                  0.1,
                ]
              }, {
                label: 'Dataset 2',
                backgroundColor: '#f79393',
                data: [
                  0.4,
                  0.3,
                  0.6,
                ]
              }
            ] 
          },
          options: {
            elements: {
              rectangle: {
                borderWidth: 2,
              }
            }, 
            scales: {
              xAxes: [{
                barPercentage: 0.5,
                barThickness: 6,
                maxBarThickness: 8,
                gridLines: {
                    offsetGridLines: true
                }
            }]
            } 
          }
        }
      }
    },
    {
      class: 'Map',
      name: 'styling',
      value: {}
    },
    {
      class: 'String',
      name: 'timeFrame',
      value: 'Weekly',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Weekly',
          'Monthly',
          'Quarterly',
          'Annually'
        ]
      }
    },
    {
      name: 'dateRange',
      expression: function (timeFrame, yItemsLimit) {
        var today = new Date();
        switch (timeFrame) {
          case 'Weekly':
            var daysToRewind = 7 * (yItemsLimit - 1);

            var sun = new Date();
            sun.setHours(0, 0, 0, 0);
            sun.setDate(sun.getDate() - sun.getDay());
            sun.setDate(sun.getDate() - daysToRewind);

            var sat = new Date(sun.getTime());
            sat.setDate(sat.getDate() + 6);
            sat.setHours(23, 59, 59, 999);

            return {
              min: sun,
              max: sat
            };
          case 'Monthly':
            var monthsToRewind = yItemsLimit - 1;

            var min = new Date();
            min.setMonth(min.getMonth() - monthsToRewind);
            min.setDate(1);
            min.setHours(0, 0, 0, 0);

            var max = new Date(min.getTime());
            max.setMonth(max.getMonth() + 1);
            max.setDate(0);
            max.setHours(23, 59, 59, 999);

            return {
              min: min,
              max: max
            };
          case 'Quarterly':
            var monthsToRewind = yItemsLimit * 3;

            var currQuarterEndMonth = today.getMonth() + (2 - today.getMonth() % 3) + 1;
            var currQuarterEnd = new Date(today.getFullYear(), currQuarterEndMonth, 0);

            var min = new Date(currQuarterEnd.getTime());
            min.setMonth(min.getMonth() - (monthsToRewind - 1));
            min.setDate(1);
            var max = new Date(min.getTime());
            max.setMonth(max.getMonth() + 3);
            max.setDate(0);
            max.setHours(23, 59, 59, 999);

            return {
              min: min,
              max: max
            };
          case 'Annually':
            var start = new Date();
            start.setFullYear(start.getFullYear() - this.rewindFactor + 1);
            start.setMonth(0);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);

            var end = new Date(start.getTime());
            end.setMonth(11);
            end.setDate(31);
            end.setHours(23, 59, 59, 999);

            return {
              min: start,
              max: end
            };
        }
      }
    },
  ],

  methods: [
    function initE() {
      // this.account$.sub(this.dataUpdate);
      // this.dateRange$.sub(this.dataUpdate);
      // this.dataUpdate();

      this.addClass(this.myClass())
        .start(this.Cols).style({ 'align-items': 'center' })
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header-title')).end()
          .start(this.Cols)
            .startContext({ data: this })
            // TODO: Add a read-only Start Date?
            // TODO: Add End Date
              .add(this.ACCOUNT)
              .add(this.TIME_FRAME)
            .endContext()
          .end()
        .end()
        .start().style({ 'width': '930px', 'height': '266px' }).addClass(this.myClass('chart'))
          .add(this.HorizontalBarDAOChartView.create({
            data$: this.cicoTransactionsDAO$,
            config$: this.config$,
            customDatasetStyling$: this.styling$,
            width: 920,
            height: 240
          }))
        .end()
    },

    function formatYAxis() {
      var self = this;
      this.config.data = {}; // Prevent cloning infinite loop. Will be repopulated.
      var config = foam.Object.clone(this.config);
    }
  ]
});
