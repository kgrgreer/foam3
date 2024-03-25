/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm.view',
  name: 'CMGraph',
  extends: 'foam.u2.View',
  documentation: `
    The view model that renders result of a CM to the graph.
  `,

  css: `
    ^warming {
      display: grid;
      place-items: center;
      height: 100%;
    }
  `,

  requires: [
    'foam.graphics.Box',
    'org.chartjs.Line2',
    'org.chartjs.Bar2'
  ],

  imports: [
    'cmDAO'
  ],

  properties: [
    {
      class: 'String',
      name: 'cmId',
      required: true,
      documentation:`
        Reference to the CM by Id.
      `
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'type of graph.'
    },
    {
      class: 'Map',
      name: 'chartJsConfig'
    }
  ],
  methods: [
    async function render() {
      var self = this;

      let cm = await self.cmDAO.find(self.cmId);
      if ( !cm ) {
        self.addClass(self.myClass('warming'))
          .start('h2')
            .add(`🚫 Can not load CM with id: \`${self.cmId}\``)
          .end();
        return;
      }
      
      let data = await self.buildCharDataSet(cm)
      let plot = await self.generatePlot(data)

      self.addClass(self.myClass('canvas-container'))
        .start('div')
          .add(plot)
        .end();
    },

    async function buildCharDataSet(cm) {
      let dataSets = {};
      dataSets['labels'] = cm.rawResult.labels
      dataSets['datasets'] = []

      for (const [k, v] of Object.entries(cm.rawResult.dataset)) {
        dataSets['datasets'].push({
          label: k,
          data: v,
          borderWidth: 1
        })
      }

      return dataSets
    },

    async function generatePlot(data) {
      return this.Line2.create({
        data,
        options: {
          legend: {
            display: false,
          },
        }
      })
    }
  ]
})