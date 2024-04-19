/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'Bar',
  extends: 'org.chartjs.AbstractChartCView',
  flags: [ 'web' ],

  properties: [
    [ 'chartType', 'bar' ]
  ],

  methods: [
    function configChart_() {
      this.config.options.scales.yAxes[0].ticks.beginAtZero = true;
    },

    function genChartData_(data) {
      var chartData = this.toChartData(data);

      chartData.datasets.forEach((d, i) => {
        d.backgroundColor = Chart.helpers.color(this.colors[i]).alpha(0.5).rgbString();
        d.borderColor     = this.colors[i];
        d.borderWidth     = 2;
      });

      return chartData;
    }
  ]
});
