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
      padding: 34px;
    }
  `,


  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
    }
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'CURRENCY EXPOSURE',
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header')).end()
          .start(this.Cols).style({ 'align-items': 'center', 'justify-content': 'center' })
            .start(this.PieDAOChartView,
              {
                // We only want to see data that has value.
                data: this.data.where(this.GT(this.CurrencyExposure.TOTAL, 0)),
                keyExpr: this.CurrencyExposure.DENOMINATION,
                valueExpr: this.CurrencyExposure.TOTAL,
                height: 300,
                width: 300,
                config: {
                  type: 'pie',
                  options: {
                    tooltips: {
                      displayColors: false,
                      callbacks: {
                        label: function(tooltipItem, data) {
                          var dataset = data.datasets[tooltipItem.datasetIndex];
                          var meta = dataset._meta[Object.keys(dataset._meta)[0]];
                          var total = meta.total;
                          var currentValue = dataset.data[tooltipItem.index];
                          var percentage = parseFloat((currentValue/total*100).toFixed(1));
                          return percentage + '%';
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
                backgroundColor: function(context) {
                  const palette = ['#202341', '#233e8b', '#406dea', '#1e1f21', '#47484a', '#9ba1a6'];
                  return palette[context.dataIndex % palette.length];
                }
              }
            ).addClass(this.myClass('pie-chart')).end()
          .end();
    }
  ]
});
