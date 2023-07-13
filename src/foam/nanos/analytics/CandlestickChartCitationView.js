/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'CandlestickChartCitationView',
  extends: 'foam.nanos.analytics.CandlestickChartView',

  documentation: 'Use to show Chart in dashboard Card',

  properties: [
    {
      class: 'Class',
      of: 'foam.nanos.analytics.Candlestick'
    }
    // populate dao, and keys in menus.jrl
  ],

  methods: [
    async function render() {
      var self = this;

      this.buildChartData().then(function(data) {
        this.chart = this.Line2.create({
          data: data,
          options: {
            legend: {
              display: false,
            },
            tooltips: {
              // see: https://github.com/chartjs/Chart.js/issues/3953
              callbacks: {
                label: function(tooltipItem, data) {
                  var dataset = data.datasets[tooltipItem.datasetIndex];
                  var index = tooltipItem.index;
                  return dataset.labels[index] + ': ' + dataset.data[index];
                }
              }
            }
          }
        });
        this.canvas.add(this.chart);
      }.bind(this));

      this.
        start('div', null, this.canvasContainer$).addClass(this.myClass('canvas-container')).
        add(this.canvas).
        end();
    }
  ]
})
