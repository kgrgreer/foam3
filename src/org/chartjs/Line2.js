/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs',
  name: 'Line2',
  extends: 'foam.graphics.CView',

  mixins: [ 'org.chartjs.Lib' ],

  properties: [
    'chart',
    {
      name: 'data',
      factory: function() {
        return {
          datasets: []
        };
      },
      postSet: function() {
        this.update();
      }
    },
    {
      name: 'options',
      postSet: function() {
        this.update();
      }
    },
    {
      name: 'localOptions',
      factory: function() {
        return {
          responsive: false,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          stacked: false,
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
            }
          }
        };
      }
    },
    // {
    //   name: 'xAxis',
    //   postSet: function(_, v) {
    //     if ( this.chart ) {
    //       this.chart.options.scales.xAxes = [v];
    //     }
    //   }
    // },
    {
      name: 'config',
      factory: function() {
        return {
          type: 'line',
          data: this.data,
          options: this.allOptions()
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
    },
    function allOptions() {
      return this.options && new Map([...new Map(Object.entries(this.localOptions)), ...new Map(Object.entries(this.options))]) || this.localOptions;
    }
  ],

  listeners: [
    {
      name: 'update',
      isFramed: true,
      on: [
        'this.propertyChange.data',
        'this.propertyChange.options'
      ],
      code: function() {
        if ( ! this.chart ) return;

        this.chart.data = this.data;
        this.chart.options = this.allOptions();
        this.chart.update();
      }
    }
  ]
});
