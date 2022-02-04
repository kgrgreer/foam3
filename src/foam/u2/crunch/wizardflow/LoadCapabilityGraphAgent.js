/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'LoadCapabilityGraphAgent',
  implements: [ 'foam.core.ContextAgent' ],

  documentation: `
    Calls crunchService to fetch the necessary prerequisie capabilities.
  `,

  imports: [
    'rootCapability'
  ],

  exports: [
    'capabilityGraph'
  ],

  requires: [
    'foam.graph.GraphBuilder',
  ],

  properties: [
    {
      name: 'capabilityGraph',
      class: 'FObjectProperty',
      of: 'foam.graph.Graph'
    }
  ],

  methods: [
    async function execute() {
      let graphBuilder = this.GraphBuilder.create();
      await graphBuilder.fromRelationship(this.rootCapability, 'prerequisites');
      this.capabilityGraph = graphBuilder.build();
    }
  ]
});

