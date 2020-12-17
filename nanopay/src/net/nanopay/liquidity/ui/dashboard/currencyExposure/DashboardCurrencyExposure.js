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
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    ^card-header {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }

    ^fill {
      flex-grow: 1;
      display: flex;
      height: 100%;
    }

    ^pie-chart {
      height: 425px;
      padding-top: 24px;
    }

    ^message-no-data {
      font-size: 16px;
      margin: 0;
      padding: 8px;
      border: solid 1px /*%GREY3%*/ #cbcfd4;
      border-radius: 3px;
    }
  `,


  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'currency'
    },
    {
      class: 'Int',
      name: 'relevantDataCount'
    },
    {
      class: 'Int',
      name: 'total'
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      value: true
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
    },
    {
      name: 'LABEL_NO_DATA',
      message: 'Not enough data to graph'
    },
    {
      name: 'LABEL_LOADING',
      message: 'Loading Data...'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.onDetach(this.homeDenomination$.sub(this.dataUpdate));
      this.dataUpdate();
      this
        .addClass(this.myClass())
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header')).end()
          .start(this.Cols).style({ 'align-items': 'center', 'justify-content': 'center' })
            // fill css class breaks pie chart
            // TODO: find better solution to center text for no data
            .enableClass(self.myClass('fill'), this.relevantDataCount$.map(count => { return count <= 0; }))
            .add(this.slot(function(currency, relevantDataCount, isLoading) {
              if ( ! currency || ! relevantDataCount || relevantDataCount <= 0 ) {
                return self.E()
                  .start('p').addClass(self.myClass('message-no-data'))
                    .callIf(isLoading, function() {
                      this.add(self.LABEL_LOADING);
                    })
                    .callIf(!isLoading, function() {
                      this.add(self.LABEL_NO_DATA)
                    })
                  .end();
              }
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
      name: 'dataUpdate',
      isFramed: true,
      code: function() {
        this.isLoading = true;
        this.currencyDAO.find(this.homeDenomination).then(currency => {
          this.currency = currency;
        });
        this.data.where(this.GT(this.CurrencyExposure.TOTAL, 0)).select(this.COUNT()).then(count => {
          this.relevantDataCount = count.value;
          this.isLoading = false;
        });
      }
    }
  ]
});
