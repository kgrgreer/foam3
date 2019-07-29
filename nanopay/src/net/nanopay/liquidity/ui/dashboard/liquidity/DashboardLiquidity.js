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
    'accountBalanceDailyCandlestickDAO',
    'accountBalanceWeeklyCandlestickDAO',
    'accountBalanceMonthlyCandlestickDAO',
    'accountBalanceQuarterlyCandlestickDAO',
    'accountBalanceAnnuallyCandlestickDAO',
    'currencyDAO',
    'liquidityThresholdCandlestickDAO',
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
      of: 'net.nanopay.liquidity.ui.dashboard.DateFrequency',
      name: 'timeFrame',
      value: 'WEEKLY'
    },
    {
      class: 'Date',
      name: 'startDate',
      factory: function() {
        return new Date(0);
      }
    },
    {
      class: 'Date',
      name: 'endDate',
      factory: function() {
        return new Date().setHours(23,59,59,999);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'aggregatedDAO',
      factory: function() {
        return foam.dao.NullDAO.create({ of: this.Candlestick });
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
    ['', 'propertyChange.aggregatedDAO', 'updateStyling'],
    ['', 'propertyChange.startDate', 'updateAggregatedDAO'],
    ['', 'propertyChange.endDate', 'updateAggregatedDAO'],
    ['', 'propertyChange.account', 'updateAggregatedDAO'],
    ['', 'propertyChange.timeFrame', 'updateAggregatedDAO'],
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
          .style({ 'height': '550px' })
          .addClass(this.myClass('chart'))
          .add(this.CandlestickDAOChartView.create({
            data: this.aggregatedDAO$proxy,
            config$: this.config$,
            customDatasetStyling$: this.styling$
          }))
        .end()
        .start(this.Cols)
          .tag(this.SectionedDetailPropertyView, {
            data: this,
            prop: this.START_DATE
          })
          .tag(this.SectionedDetailPropertyView, {
            data: this,
            prop: this.END_DATE
          })
        .end();
    }
  ],

  listeners: [
    {
      name: 'updateAggregatedDAO',
      isFramed: true,
      code: function() {
        this.aggregatedDAO = ( this.account && this.timeFrame ) ?
          this.PromisedDAO.create({
            of: this.Candlestick,
            promise: new Promise(async function(resolve) {

              var dao = this.EasyDAO.create({
                of: this.Candlestick,
                daoType: 'MDAO'
              });
              var sink = this.DAOSink.create({ dao: dao });

              // Fill the DAO with the account balance history.
              var account = await this.account$find;
              await this['accountBalance' + this.timeFrame.label + 'CandlestickDAO']
                .where(this.AND(
                  this.GTE(this.Candlestick.CLOSE_TIME, this.startDate),
                  this.LTE(this.Candlestick.CLOSE_TIME, this.endDate),
                  this.EQ(this.Candlestick.KEY, account.id)
                ))
                .select(sink);

              // If there are no liquidity settings, there's nothing more to do.
              if ( ! account.liquiditySetting ) {
                resolve(dao);
                return;
              }

              var liquiditySetting = await account.liquiditySetting$find;

              // Only put liquidity history that spans the range of the balance history.
              // i.e. If the startDate is May 1st but balance histories don't start until
              // July 1st, we want liquidity settings to start at July 1st but if liquidity
              // settings haven't been touched since June 1st, we need to render the point
              // from June 1st at July 1st.
              var minTime = await dao.select(this.MIN(this.Candlestick.CLOSE_TIME));
              minTime = minTime.value || new Date();
              var maxTime = await dao.select(this.MAX(this.Candlestick.CLOSE_TIME));
              maxTime = maxTime.value || new Date();

              var fillLiquidityHistory = async function(threshold) {
                // If the liquidity setting is not enabled, just do not display
                if ( ! liquiditySetting[threshold + 'Liquidity'].enabled ) return;

                var key = account.liquiditySetting + ':' + threshold;
                var liquidityHistoryDAO = this.liquidityThresholdCandlestickDAO
                  .where(this.EQ(this.Candlestick.KEY, key));

                var first = (await liquidityHistoryDAO
                  .where(this.LTE(this.Candlestick.CLOSE_TIME, minTime))
                  .orderBy(this.DESC(this.Candlestick.CLOSE_TIME))
                  .limit(1)
                  .select()).array[0];
                if ( first ) {
                  first = first.clone();
                  first.closeTime = minTime;
                  await dao.put(first);
                }

                var last = (await liquidityHistoryDAO
                  .where(this.GTE(this.Candlestick.CLOSE_TIME, maxTime))
                  .orderBy(this.Candlestick.CLOSE_TIME)
                  .limit(1)
                  .select()).array[0];
                if ( last ) {
                  last = last.clone();
                  last.closeTime = maxTime;
                  await dao.put(last);
                } else {
                  await dao.put(this.Candlestick.create({
                    closeTime: maxTime,
                    key: key,
                    total: liquiditySetting[threshold + 'Liquidity'].threshold,
                    count: 1
                  }));
                }

                await liquidityHistoryDAO
                  .where(this.AND(
                    this.GTE(this.Candlestick.CLOSE_TIME, minTime),
                    this.LTE(this.Candlestick.CLOSE_TIME, maxTime)
                  ))
                  .select(sink);
              }.bind(this)

              await fillLiquidityHistory('low');
              await fillLiquidityHistory('high');

              resolve(dao);
            }.bind(this))
          }) : undefined;
      }
    },
    {
      name: 'updateStyling',
      isFramed: true,
      code: async function() {
        var a = await this.account$find;
        if ( ! a ) return;

        var c = await this.currencyDAO.find(a.denomination)

        this.config.options.scales.yAxes = [{
            ticks: {
              callback: function(v) {
                return `${c.format(v)}`;
              }
            }
        }];
        this.config.options.tooltips = {
          displayColors: false,
          callbacks: {
            label: function(v) {
              return `${c.format(v.yLabel)}`;
            }
          }
        }

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
          borderColor: ['#32bf5e'],
          backgroundColor: 'rgba(0, 0, 0, 0.0)',
          label: this.LABEL_HIGH_THRESHOLD,
        }
        this.styling = style;
      }
    }
  ]
});
