/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm.view',
  name: 'CMPie',
  extends: 'foam.nanos.cm.view.CMGraph',
  documentation: `
    Render DatasetCM into the Pie Plot
  `,

  requires: [
    'foam.graphics.Box',
    'org.chartjs.Pie2'
  ],

  methods: [
    async function render() {
      this.SUPER();
    },

    async function buildChartDataSet(cm) {
      let dataSets = [];

      for (const [k, v] of Object.entries(cm.dataset)) {
        dataSets.push({
          labels: cm.labels,
          datasets: [{
            label: k,
            data: v
          }]
        })
      }

      return dataSets
    },

    async function generatePlots(data) {
      return data.map(d => {
        return this.Pie2.create({
          data: d
        })
      });
    }
  ]
})