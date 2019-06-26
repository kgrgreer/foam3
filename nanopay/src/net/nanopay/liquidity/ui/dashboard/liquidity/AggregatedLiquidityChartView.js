foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.liquidity',
  name: 'AggregatedLiquidityChartView',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.EasyDAO',
    'foam.nanos.analytics.Candlestick',
    'org.chartjs.CandlestickDAOChartView',
    'foam.u2.borders.CardBorder',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols'
  ],

  imports: [
    'accountDAO',
    'accountBalanceCandlestickDAO',
    'accountBalanceWeeklyCandlestickDAO',
    'accountBalanceMonthlyCandlestickDAO',
    'accountBalanceQuarterlyCandlestickDAO',
    'accountBalanceAnnuallyCandlestickDAO',
    'currencyDAO',
    'liquidityThresholdWeeklyCandlestickDAO',
    'liquidityThresholdMonthlyCandlestickDAO',
    'liquidityThresholdQuarterlyCandlestickDAO',
    'liquidityThresholdAnnuallyCandlestickDAO',
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
      name: 'LABEL_HIGH_THRESHOLD',
      message: 'High Threshold'
    },
    {
      name: 'LABEL_LOW_THRESHOLD',
      message: 'Low Threshold'
    },
    {
      name: 'LABEL_MILLIONS',
      message: 'Millions'
    },
    {
      name: 'CARD_HEADER',
      message: 'LIQUIDITY',
    }
  ],

  properties: [
    {
      name: 'account',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO,
          placeholder: 'Please select',
          objToChoice: function(a) {
            return [a, a.name];
          }
        });
      }
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
      },
      postSet: function(_,_) {
        this.rewindFactor = 1;
      }
    },
    {
      class: 'Int',
      name: 'rewindFactor',
      value: 1
    },
    {
      name: 'dateRange',
      expression: function(timeFrame, rewindFactor) {
        var today = new Date();
        switch( timeFrame ) {
          case 'Weekly':
            var daysToRewind = 7 * ( this.rewindFactor - 1 );

            var sun = new Date();
            sun.setHours(0,0,0,0);
            sun.setDate(sun.getDate() - sun.getDay());
            sun.setDate(sun.getDate() - daysToRewind);

            var sat = new Date(sun.getTime());
            sat.setDate(sat.getDate() + 6);
            sat.setHours(23,59,59,999);

            return {
              min: sun,
              max: sat
            };
          case 'Monthly':
            var monthsToRewind = rewindFactor - 1;

            var min = new Date();
            min.setMonth(min.getMonth() - monthsToRewind);
            min.setDate(1);
            min.setHours(0,0,0,0);

            var max = new Date(min.getTime());
            max.setMonth(max.getMonth() + 1);
            max.setDate(0);
            max.setHours(23,59,59,999);

            return {
              min: min,
              max: max
            };
          case 'Quarterly':
            var monthsToRewind = rewindFactor * 3;

            var currQuarterEndMonth = today.getMonth() + (2 - today.getMonth() % 3) + 1;
            var currQuarterEnd = new Date(today.getFullYear(), currQuarterEndMonth, 0);

            var min = new Date(currQuarterEnd.getTime());
            min.setMonth(min.getMonth() - (monthsToRewind - 1));
            min.setDate(1);
            var max = new Date(min.getTime());
            max.setMonth(max.getMonth() + 3);
            max.setDate(0);
            max.setHours(23,59,59,999);

            return {
              min: min,
              max: max
            };
          case 'Annually':
            var start = new Date();
            start.setFullYear(start.getFullYear() - this.rewindFactor + 1);
            start.setMonth(0);
            start.setDate(1);
            start.setHours(0,0,0,0);

            var end = new Date(start.getTime());
            end.setMonth(11);
            end.setDate(31);
            end.setHours(23,59,59,999);

            return {
              min: start,
              max: end
            };
        }
      }
    },
    {
      name: 'accountCurrency'
    },
    {
      class: 'foam.dao.DAOProperty',
      hidden: true,
      name: 'balanceCandlestickDAO',
      expression: function(account, timeFrame) {
        var pred = this.EQ(this.Candlestick.KEY, account.id);
        return this.accountBalanceCandlestickDAO.where(pred);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      hidden: true,
      name: 'liquidityThresholdCandlestickDAO',
      expression: function(account) {
        var high = `${account.id}:high`;
        var low = `${account.id}:low`;
        var pred = this.OR(this.EQ(this.Candlestick.KEY, high), this.EQ(this.Candlestick.KEY, low));
        return this.liquidityThresholdWeeklyCandlestickDAO.where(pred);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'aggregatedDAO',
      factory: function() {
        return this.EasyDAO.create({
          of: 'foam.nanos.analytics.Candlestick',
          daoType: 'ARRAY'
        });
      }
    },
    {
      class: 'Map',
      name: 'config',
      factory: function() {
        var self = this;
        return {
          type: 'line',
          data: { datasets: [] },
          options: {
            // responsive: false,
            maintainAspectRatio: false,
            scales: {
              xAxes: [{
                type: 'time',
                time: {
                  min: this.dateRange.min,
                  max: this.dateRange.max,
                  displayFormats: {
                    hour: 'MMM D',
                    quarter: 'MMM YYYY'
                  }
                },
                distribution: 'linear'
              }]
            },
            // tooltips: {
            //   displayColors: false,
            //   callbacks: {
            //     title: function(_, _) {
            //       return self.account.name;
            //     },
            //     label: function(tooltipItem, _) {
            //       return `${self.account.denomination} ${self.accountCurrency.format(Math.floor(parseFloat(tooltipItem.yLabel)))}`;
            //     }
            //   }
            // }
          }
        }
      }
    },
    {
      class: 'Map',
      name: 'styling',
      value: {}
    }
  ],

  methods: [
    function initE() {
      this.account$.sub(this.dataUpdate);
      this.dateRange$.sub(this.dataUpdate);
      this.dataUpdate();

      this.addClass(this.myClass())
        .start(this.Cols).style({ 'align-items': 'center' })
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header-title')).end()
          .start(this.Cols)
            .startContext({ data: this })
              .add(this.ACCOUNT)
              .add(this.TIME_FRAME)
            .endContext()
          .end()
        .end()
        .start().style({ 'width': '700px', 'height': '600px' }).addClass(this.myClass('chart'))
          .add(this.CandlestickDAOChartView.create({
            data$: this.aggregatedDAO$,
            config$: this.config$,
            customDatasetStyling$: this.styling$,
            width: 700,
            height: 600
          }))
        .end()
        .startContext({ data: this })
          .start(this.Cols).style({ 'align-items': 'center' }).addClass(this.myClass('shifter'))
            .tag(this.REWIND, {
              buttonStyle: foam.u2.ButtonStyle.SECONDARY,
              label: '',
              icon: 'images/arrow-left-black.svg'
            })
            .tag(this.FORWARD, {
              buttonStyle: foam.u2.ButtonStyle.SECONDARY,
              label: '',
              icon: 'images/arrow-right-black.svg'
            })
          .end()
        .endContext();
    },

    function style(keyMap) {
      var datasetStyling = {};
      for ( var key in keyMap ) {
        if ( key.includes(':') ) {
          var label = key.includes('high') ? this.LABEL_HIGH_THRESHOLD : this.LABEL_LOW_THRESHOLD
          datasetStyling[key] = {
            steppedLine: true,
            borderColor: [
              '#a61414'
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.0)',
            label: label
          }
        } else {
          var datasetLabel = this.accountCurrency ? `[${this.accountCurrency.alphabeticCode}] ${this.account.name}` : this.account.name;
          datasetStyling[key] = {
            steppedLine: true,
            borderColor: [
              '#406dea'
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.0)',
            label: datasetLabel
          }
        }
      }
      this.styling = datasetStyling;
    },

    function formatYAxis() {
      var self = this;
      this.config.data = {}; // Prevent cloning infinite loop. Will be repopulated.
      var config = foam.Object.clone(this.config);
      config.options.scales.xAxes = [{
        type: 'time',
        time: {
          min: this.dateRange.min,
          max: this.dateRange.max,
          displayFormats: {
            hour: 'MMM D',
            quarter: 'MMM YYYY'
          }
        },
        distribution: 'linear'
      }];

      if ( this.accountCurrency && this.account ) {
        config.options.scales.yAxes = [{
          ticks: {
            callback: function(label, index, labels) {
              return self.accountCurrency.format(Math.floor(parseFloat(label)));
            }
          },
          scaleLabel: {
            display: true,
            labelString: this.accountCurrency.name
          }
        }];
      }
      this.config = config;
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: async function() {
        this.formatYAxis();
        if ( ! this.account ) return;
        var aggregate = this.EasyDAO.create({
          of: 'foam.nanos.analytics.Candlestick',
          daoType: 'ARRAY'
        });
        this.accountCurrency = await this.currencyDAO.find(this.account.denomination);
        var balanceSink = await this.balanceCandlestickDAO.select();
        var keyMap = {};
        balanceSink.array.forEach(b => {
          if ( b.closeTime >= this.dateRange.min && b.closeTime <= this.dateRange.max ) {
            aggregate.put(b);
            keyMap[b.key] = 1;
          }
        });

        if ( this.liquidityThresholdCandlestickDAO ) {
          var liquiditySink = await this.liquidityThresholdCandlestickDAO.select();
          liquiditySink.array.forEach(function(l) {
            if ( l.closeTime >= this.dateRange.min && l.closeTime <= this.dateRange.max ) {
              aggregate.put(l);
              keyMap[l.key] = 1;
            }
          });
        }
        this.style(keyMap);
        this.aggregatedDAO = aggregate;
      }
    }
  ],

  actions: [
    {
      name: 'rewind',
      code: function() {
        this.rewindFactor++;
      }
    },
    {
      name: 'forward',
      isEnabled: function(rewindFactor) {
        return rewindFactor !== 1;
      },
      code: function() {
        this.rewindFactor--;
      }
    }
  ]
});
