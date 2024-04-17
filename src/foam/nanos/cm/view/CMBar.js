/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm.view',
  name: 'CMBar',
  extends: 'foam.nanos.cm.view.CMGraph',
  documentation: `
    Render DatasetCM into the Bar Plot
  `,

  requires: [
    'foam.graphics.Box',
    'org.chartjs.Bar2'
  ],

  methods: [
    async function render() {
      this.SUPER();
    },

    async function generatePlots(data) {
      return [
        this.Bar2.create({
          data,
          options: {
            legend: {
              display: false,
            },
          }
        })
      ]
    }
  ]
})