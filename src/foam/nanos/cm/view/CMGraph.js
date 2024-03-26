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
    ^plot {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    ^plot-item {
      width: 100%
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

      if ( !cm.labels || !cm.dataset ) {
        self.addClass(self.myClass('warming'))
          .start('h2')
            .add(`🚫 Empty Data with CM id: \`${self.cmId}\``)
          .end();
        return;
      }
      
      let data = await self.buildCharDataSet(cm)
      let plots = await self.generatePlots(data)

      self.addClass(self.myClass('canvas-container'))
        .start('div').addClass(self.myClass('plot'))
          .forEach(plots, function(plot) {
            this.start('div').addClass(self.myClass('plot-item'))
              .add(plot)
            .end()
          })
        .end();
    },

    async function buildCharDataSet(cm) {
      let dataSets = {};
      dataSets['labels'] = cm.labels
      dataSets['datasets'] = []

      for (const [k, v] of Object.entries(cm.dataset)) {
        dataSets['datasets'].push({
          label: k,
          data: v,
          borderWidth: 1
        })
      }

      return dataSets
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