/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm.view',
  name: 'CMLine',
  extends: 'foam.nanos.cm.view.CMGraph',
  documentation: `
    Render DatasetCM into the Line Plot
  `,

  requires: [
    'foam.graphics.Box',
    'org.chartjs.Line2',
  ],

  methods: [
    async function render() {
      this.SUPER();
    },

    async function generatePlots(data) {
      return [
        this.Line2.create({
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