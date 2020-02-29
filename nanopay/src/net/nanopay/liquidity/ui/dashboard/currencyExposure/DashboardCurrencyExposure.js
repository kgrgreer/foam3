foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.currencyExposure',
  name: 'DashboardCurrencyExposure',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'org.chartjs.PieDAOChartView',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposure'
  ],

  imports: [
    'homeDenomination',
    'currencyDAO'
  ],

  css: `
    ^ {
      padding: 32px 16px;
    }

    ^card-header {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }

    ^pie-chart {
      height: 425px;
      padding-top: 24px;
    }
  `,


  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Currency',
      name: 'currency'
    },
    {
      class: 'Int',
      name: 'total'
    }
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'CURRENCY EXPOSURE',
    },
    {
      name: 'TOOLTIP_EXPOSURE',
      message: 'Exposure'
    },
    {
      name: 'TOOLTIP_VALUE',
      message: 'Value in'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.onDetach(this.homeDenomination$.sub(this.currencyUpdate));
      this.currencyUpdate();
      this
        .addClass(this.myClass())
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header')).end()
          .start(this.Cols).style({ 'align-items': 'center', 'justify-content': 'center' })
            .add(this.slot(function(currency) {
              return self.E()
                .start(this.PieDAOChartView, {
                  // We only want to see data that has value.
                  data: this.data.where(this.GT(this.CurrencyExposure.TOTAL, 0)),
                  keyExpr: this.CurrencyExposure.DENOMINATION,
                  valueExpr: this.CurrencyExposure.TOTAL,
                  config: {
                    type: 'pie',
                    options: {
                      tooltips: {
                        displayColors: false,
                        callbacks: {
                          label: function(tooltipItem, data) {
                            var dataset = data.datasets[tooltipItem.datasetIndex];
                            self.total = 0;
                            dataset.data.forEach(total => self.total += total);
                            var meta = dataset._meta[Object.keys(dataset._meta)[0]];
                            var currentValue = dataset.data[tooltipItem.index];
                            var percentage = parseFloat((currentValue/self.total*100).toFixed(1));
                            return self.currency ?
                              [`${self.TOOLTIP_EXPOSURE}: ${percentage}%`, `${self.TOOLTIP_VALUE} ${self.homeDenomination}: ${self.currency.format(currentValue)}`] :
                              [`${self.TOOLTIP_EXPOSURE}: ${percentage}%`];
                          },
                          title: function(tooltipItem, data) {
                            return data.labels[tooltipItem[0].index];
                          }
                        }
                      },
                      legend: {
                        labels: {
                          boxWidth: 20
                        }
                      }
                    }
                  },
                  palette: [
                    '#afd3bb',
                    '#cb8363',
                    '#b82850',
                    '#25548b',
                    '#92267a',
                    '#07a7fe',
                    '#a5d8a5',
                    '#0760de',
                    '#64651b',
                    '#8176fd',
                    '#3b0b65',
                    '#38c2f4',
                    '#6ce179',
                    '#b9b2e4',
                    '#3ae83f',
                    '#2ec3c9',
                    '#05d6aa',
                    '#7a63e6',
                    '#dce644',
                    '#844b8a',
                    '#e05115',
                    '#bd2d84',
                    '#c4db48',
                    '#183966',
                    '#ac9997',
                    '#386278',
                    '#ccc64b'
                  ]
                })
                  .addClass(this.myClass('pie-chart'))
                .end()
            }))
          .end();
    }
  ],

  listeners: [
    {
      name: 'currencyUpdate',
      isFramed: true,
      code: function() {
        this.currencyDAO.find(this.homeDenomination).then(currency => {
          this.currency = currency
        });
      }
    }
  ]
});
