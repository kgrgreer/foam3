/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'Pie2',
  extends: 'foam.graphics.CView',

  mixins: [ 'org.chartjs.Lib' ],

  properties: [
    'chart',
    {
      name: 'data',
      factory: function() {
        return {
          labels: [],
          datasets: []
        };
      },
      postSet: function() {
        this.update();
      }
    },
    {
      name: 'chartJSOptions',
      factory: function() {
        return {};
      },
    },
    {
      name: 'config',
      factory: function() {
        return {
          type: 'pie',
          data: this.data,
          options: {...this.chartJSOptions}
        };
      }
    }
  ],

  methods: [
    function paintSelf(x) {
      if ( ! this.chart ) {
        this.chart = new Chart(x, this.config);
        this.update();
      }
      this.chart.render();
    }
  ],

  listeners: [
    {
      name: 'update',
      isFramed: true,
      on: [
        'this.propertyChange.data'
      ],
      code: function() {
        if ( ! this.chart ) return;

        this.chart.data = this.data;
        this.chart.update();
      }
    }
  ]
});
