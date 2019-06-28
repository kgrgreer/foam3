foam.ENUM({
  package: 'net.nanopay.liquidity.ui.dashboard.liquidity',
  name: 'TimeFrame',
  values: [
    {
      name: 'WEEKLY',
      label: 'Weekly'
    },
    {
      name: 'MONTHLY',
      label: 'Monthly'
    },
    {
      name: 'QUARTERLY',
      label: 'Quarterly'
    },
    {
      name: 'ANNUALLY',
      label: 'Annually'
    },
  ]
});

foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.liquidity',
  name: 'DashboardLiquidity',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.DAOSink',
    'foam.dao.EasyDAO',
    'foam.dao.PromisedDAO',
    'foam.nanos.analytics.Candlestick',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Cols',
    'net.nanopay.account.DigitalAccount',
    'org.chartjs.CandlestickDAOChartView',
  ],

  imports: [
    'accountBalanceWeeklyCandlestickDAO',
    'accountBalanceMonthlyCandlestickDAO',
    'accountBalanceQuarterlyCandlestickDAO',
    'accountBalanceAnnuallyCandlestickDAO',
    'currencyDAO',
    'liquidityThresholdHourlyCandlestickDAO',
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
  `,

  messages: [
    {
      name: 'LABEL_HIGH_THRESHOLD',
      message: 'High Threshold'
    },
    {
      name: 'LABEL_LOW_THRESHOLD',
      message: 'Low Threshold'
    },
    {
      name: 'CARD_HEADER',
      message: 'LIQUIDITY',
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      view: function(_, x) {
        var self = x.data;
        var prop = this;
        var v = foam.u2.view.ReferenceView.create(null, x);
        v.fromProperty(prop);
        v.dao = v.dao.where(foam.mlang.predicate.IsClassOf.create({
          targetClass: self.DigitalAccount
        }));
        return v;
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.ui.dashboard.liquidity.TimeFrame',
      name: 'timeFrame',
      value: 'WEEKLY'
    },
    {
      class: 'DateTime',
      name: 'startTime',
      factory: function() {
        return new Date(0);
      }
    },
    {
      class: 'DateTime',
      name: 'endTime',
      factory: function() {
        return new Date();
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'aggregatedDAO',
      expression: function(startTime, endTime, account, timeFrame) {
        if ( ! account || ! timeFrame ) return foam.dao.NullDAO.create({ of: this.Candlestick });
        return this.PromisedDAO.create({
          of: this.Candlestick,
          promise: this.account$find
            .then(a => {
              var balanceDAO = this['accountBalance' + timeFrame.label + 'CandlestickDAO']
                .where(this.AND(
                  this.GTE(this.Candlestick.CLOSE_TIME, startTime),
                  this.LTE(this.Candlestick.CLOSE_TIME, endTime),
                  this.EQ(this.Candlestick.KEY, account)
                ));

              var liquidityDAO = this.liquidityThresholdHourlyCandlestickDAO
                .where(this.AND(
                  this.GTE(this.Candlestick.CLOSE_TIME, startTime),
                  this.LTE(this.Candlestick.CLOSE_TIME, endTime),
                  this.OR(
                    this.EQ(this.Candlestick.KEY, a.liquiditySetting+':low'),
                    this.EQ(this.Candlestick.KEY, a.liquiditySetting+':high')
                  )
                ));

              var sink = this.DAOSink.create({
                dao: this.EasyDAO.create({
                  of: this.Candlestick,
                  daoType: 'MDAO'
                })
              });

              return Promise.all([
                balanceDAO.select(sink),
                liquidityDAO.select(sink)
              ])
            })
            .then(ar => {
              return ar[0].dao;
            })
        })
      }
    },
    {
      class: 'Map',
      name: 'config',
      factory: function() {
        var self = this;
        return {
          type: 'line',
          options: {
            scales: {
              xAxes: [{
                type: 'time',
                time: {
                  displayFormats: {
                    hour: 'MMM D',
                    quarter: 'MMM YYYY'
                  }
                },
                distribution: 'linear'
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
    }
  ],

  reactions: [
    ['', 'propertyChange.account', 'updateStyling']
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.Cols)
          .style({ 'align-items': 'center' })
          .start()
            .add(this.CARD_HEADER)
            .addClass(this.myClass('card-header-title'))
           .end()
          .start(this.Cols)
            .startContext({ data: this })
              .add(this.ACCOUNT)
              .add(this.TIME_FRAME)
            .endContext()
          .end()
        .end()
        .start()
          .style({ 'width': '700px', 'height': '600px' })
          .addClass(this.myClass('chart'))
          .add(this.CandlestickDAOChartView.create({
            data: this.aggregatedDAO$proxy,
            config$: this.config$,
            customDatasetStyling$: this.styling$,
            width: 700,
            height: 600
          }))
        .end()
        .start(this.Cols)
          .tag(this.SectionedDetailPropertyView, {
            data: this,
            prop: this.START_TIME
          })
          .tag(this.SectionedDetailPropertyView, {
            data: this,
            prop: this.END_TIME
          })
        .end();
    }
  ],

  listeners: [
    {
      name: 'updateStyling',
      isFramed: true,
      code: function() {
        this.account$find
          .then(a => {
            return Promise.all([
              Promise.resolve(a),
              this.currencyDAO.find(a.denomination)
            ]);
          })
          .then(ar => {
            var c = ar[1];
            this.config.options.scales.yAxes = [{
                ticks: {
                  callback: function(v) {
                    return c.format(Math.floor(v));
                  }
                }
            }];
            this.config.options.tooltips.callbacks.label = function(v) {
              return c.format(Math.floor(v.yLabel));
            };

            var a = ar[0];
            var style = {};
            style[a.id] = {
              lineTension: 0,
              borderColor: ['#406dea'],
              backgroundColor: 'rgba(0, 0, 0, 0.0)',
              label: `[${a.denomination}] ${a.name}`
            }
            style[a.liquiditySetting+':low'] = {
              steppedLine: true,
              borderColor: ['#a61414'],
              backgroundColor: 'rgba(0, 0, 0, 0.0)',
              label: this.LABEL_LOW_THRESHOLD
            }
            style[a.liquiditySetting+':high'] = {
              steppedLine: true,
              borderColor: ['#a61414'],
              backgroundColor: 'rgba(0, 0, 0, 0.0)',
              label: this.LABEL_HIGH_THRESHOLD
            }
            this.styling = style;
          });
      }
    }
  ]
});
