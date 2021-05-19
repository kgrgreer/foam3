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
    'foam.glang.EndOfDay',
    'foam.glang.EndOfWeek',
    'foam.mlang.IdentityExpr',
    'foam.mlang.predicate.IsClassOf',
    'foam.nanos.analytics.Candlestick',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Cols',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.ui.dashboard.DateFrequency',
    'net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidityChart',
    'org.chartjs.CandlestickDAOChartView',
  ],

  imports: [
    'accountBalanceHourlyCandlestickDAO',
    'accountBalanceAnnuallyCandlestickDAO',
    'accountBalanceDailyCandlestickDAO',
    'accountBalanceMonthlyCandlestickDAO',
    'accountBalanceQuarterlyCandlestickDAO',
    'accountBalanceWeeklyCandlestickDAO',
    'accountDAO',
    'currencyDAO',
    'liquidityThresholdCandlestickDAO',
    'filteredAccountDAO'
  ],

  css: `
    ^ {
      padding: 32px 16px;
    }

    ^ .property-account {
      display: inline-block;
      min-width: 240px;
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
    },
    {
      name: 'LABEL_DISCLAIMER',
      message: 'A future date will not be reflected on the graph'
    }
  ],

  properties: [
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
              dao: X.filteredAccountDAO
            },
          ],
          search: true,
          searchPlaceholder: 'Search...'
        };
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.ui.dashboard.DateFrequency',
      name: 'timeFrame',
      value: 'DAILY'
    },
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
        // WIP
        return {
          type: 'line',
          options: {
            scales: {
              xAxes: [{
                type: 'time',
                bounds: 'ticks',
                time: {
                  round: true,
                  displayFormats: {
                    millisecond: 'll',
                    second: 'll',
                    minute: 'll',
                    hour: 'll',
                    day: 'll',
                    week: 'll',
                    month: 'll',
                    quarter: 'll',
                    year: 'll'
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
      name: 'styling'
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
          .add(this.DashboardLiquidityChart.create({
            data: this.aggregatedDAO$proxy,
            config$: this.config$,
            customDatasetStyling$: this.styling$,
            startDate$: this.startDate$,
            endDate$: this.endDate$
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
        .end()
        .start('p').addClass('disclaimer').add(this.LABEL_DISCLAIMER).end();
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
              if( this.timeFrame.label === 'Hourly' ){
              await this['accountBalance' + this.timeFrame.label + 'CandlestickDAO']
                .where(this.AND(
                  this.EQ(this.Candlestick.KEY, account.id)
                ))
                .select(sink);
              }
              else {
              await this['accountBalance' + this.timeFrame.label + 'CandlestickDAO']
                .where(this.AND(
                  this.GTE(this.Candlestick.CLOSE_TIME, this.startDate),
                  this.LTE(this.Candlestick.CLOSE_TIME, this.endDate),
                  this.EQ(this.Candlestick.KEY, account.id)
                ))
                .select(sink);
              }

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

                var first = await liquidityHistoryDAO
                  .where(this.LTE(this.Candlestick.CLOSE_TIME, minTime))
                  .orderBy(this.DESC(this.Candlestick.CLOSE_TIME))
                  .limit(1)
                  .select()
                first = first.array[0];
                if ( first ) {
                  first = first.clone();
                  first.closeTime = minTime;
                  await dao.put(first);
                }

                var last = await liquidityHistoryDAO
                  .where(this.GTE(this.Candlestick.CLOSE_TIME, maxTime))
                  .orderBy(this.Candlestick.CLOSE_TIME)
                  .limit(1)
                  .select();
                last = last.array[0]
                if ( last ) {
                  last = last.clone();
                  last.closeTime = maxTime;
                  await dao.put(last);
                } else {
                  await dao.put(this.Candlestick.create({
                    closeTime: this.endDate,
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
        };

        var unit = 'day';
        switch ( this.timeFrame ) {
          case this.DateFrequency.WEEKLY:
            unit = 'week';
            break;
          case this.DateFrequency.MONTHLY:
            unit = 'month';
            break;
          case this.DateFrequency.QUARTERLY:
            unit = 'quarter';
            break;
          case this.DateFrequency.ANNUALLY:
            unit = 'year';
            break;
          default:
            unit = 'day';
        }

        var xAxesMap = this.config.options.scales.xAxes[0];
        xAxesMap.time.unit = unit;
        xAxesMap.bounds = 'ticks';

        var style = {};
        style[a.id] = {
          lineTension: 0,
          borderColor: ['#406dea'],
          backgroundColor: 'rgba(0, 0, 0, 0.0)',
          label: `[${a.denomination}] ${a.name}`
        }
        style[a.liquiditySetting+':low'] = {
          steppedLine: true,
          spanGaps: true,
          borderColor: ['#a61414'],
          backgroundColor: 'rgba(0, 0, 0, 0.0)',
          label: this.LABEL_LOW_THRESHOLD
        }
        style[a.liquiditySetting+':high'] = {
          steppedLine: true,
          spanGaps: true,
          borderColor: ['#32bf5e'],
          backgroundColor: 'rgba(0, 0, 0, 0.0)',
          label: this.LABEL_HIGH_THRESHOLD,
        }
        this.styling = style;
      }
    }
  ]
});
