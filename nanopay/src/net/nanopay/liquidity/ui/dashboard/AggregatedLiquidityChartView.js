foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard',
  name: 'AggregatedLiquidityChartView',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.EasyDAO',
    'foam.nanos.analytics.Candlestick',
    'org.chartjs.CandlestickDAOChartView'
  ],

  imports: [
    'accountDAO',
    'accountBalanceCandlestickDAO',
    'accountBalanceWeeklyCandlestickDAO',
    'accountBalanceMonthlyCandlestickDAO',
    'accountBalanceQuarterlyCandlestickDAO',
    'accountBalanceAnnuallyCandlestickDAO',
    'liquidityThresholdWeeklyCandlestickDAO',
    'liquidityThresholdMonthlyCandlestickDAO',
    'liquidityThresholdQuarterlyCandlestickDAO',
    'liquidityThresholdAnnuallyCandlestickDAO',
  ],

  css: `
    ^ .property-account {
      display: inline-block;
    }

    ^ .property-timeFrame {
      display: inline-block;
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
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'account',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO,
          placeholder: 'Please select',
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      class: 'String',
      name: 'timeFrame',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          'Weekly',
          'Monthly',
          'Quarterly',
          'Annually'
        ]
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      hidden: true,
      name: 'balanceCandlestickDAO',
      expression: function(account, timeFrame) {
        var pred = this.EQ(this.Candlestick.KEY, account);
        console.log(`${account} || ${timeFrame}`)
        switch (timeFrame) {
          case this.WEEKLY:
            return this.accountBalanceCandlestickDAO.where(pred);
          case this.MONTHLY:
            return this.accountBalanceCandlestickDAO.where(pred);
          case this.QUARTERLY:
            return this.accountBalanceCandlestickDAO.where(pred);
          case this.ANNUALLY:
            return this.accountBalanceCandlestickDAO.where(pred);
          default:
            return this.accountBalanceCandlestickDAO.where(pred);
        }
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      hidden: true,
      name: 'liquidityThresholdCandlestickDAO',
      expression: function(account, timeFrame) {
        var high = `${account}:high`;
        var low = `${account}:low`;
        var pred = this.OR(this.EQ(this.Candlestick.KEY, high), this.EQ(this.Candlestick.KEY, low));
        switch (timeFrame) {
          case this.WEEKLY:
            return this.liquidityThresholdWeeklyCandlestickDAO.where(pred);
          case this.MONTHLY:
            return this.liquidityThresholdMonthlyCandlestickDAO.where(pred);
          case this.QUARTERLY:
            return this.liquidityThresholdQuarterlyCandlestickDAO.where(pred);
          case this.ANNUALLY:
            return this.liquidityThresholdAnnuallyCandlestickDAO.where(pred);
          default:
            return null;
        }
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
      name: 'styling',
      value: {}
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.account$.sub(this.dataUpdate);
      this.timeFrame$.sub(this.dataUpdate);
      this.dataUpdate();

      this.addClass(this.myClass())
        .startContext({ data: this })
          .add(this.ACCOUNT)
          .add(this.TIME_FRAME)
        .endContext()
        .start().style({ 'width': '700px', 'height': '500px' })
          .add(this.CandlestickDAOChartView.create({
            data$: this.aggregatedDAO$,
            customDatasetStyling$: this.styling$,
            width: 600,
            height: 500
          }))
        .end();
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
          datasetStyling[key] = {
            steppedLine: true,
            borderColor: [
              '#406dea'
            ],
            backgroundColor: 'rgba(0, 0, 0, 0.0)',
            label: this.account
          }
        }
      };
      this.styling = datasetStyling;
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: async function() {
        if ( ! this.account ) return;
        var aggregate = this.EasyDAO.create({
          of: 'foam.nanos.analytics.Candlestick',
          daoType: 'ARRAY'
        });
        var balanceSink = await this.balanceCandlestickDAO.select();
        var keyMap = {};
        balanceSink.array.forEach(function(b) {
          aggregate.put(b);
          keyMap[b.key] = 1;
        });
        if ( this.liquidityThresholdCandlestickDAO ) {
          var liquiditySink = await this.liquidityThresholdCandlestickDAO.select();
          liquiditySink.array.forEach(function(l) {
            aggregate.put(l);
            keyMap[l.key] = 1;
          });
        }
        this.style(keyMap);
        this.aggregatedDAO = aggregate;
      }
    }
  ]
});
