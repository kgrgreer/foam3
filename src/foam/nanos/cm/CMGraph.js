/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm',
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
    }
  ],
  methods: [
    async function render() {
      var self = this;

      // let cm = await self.cmDAO.find(self.cmId);
      let cm = await self.cmDAO.find("....");
      if ( !cm ) {
        self.addClass(self.myClass('warming'))
          .start('h2')
            .add(`🚫 Can not load CM with id: \`${self.cmId}\``)
          .end();
        return;
      }
      console.log("......", cm)
      //1. show error message if CM not found.
    },

    async function buildData() {

    },
    async function generatePlot() {
    }
  ]
})