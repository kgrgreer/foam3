/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.async',
  name: 'AdvanceToAgent',
  extends: 'foam.util.async.MetaContextAgent',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Boolean',
      name: 'after'
    }
  ],

  methods: [
    async function execute(x) {
      let i = x.targetPosition;

      for (
        let i = x.targetPosition;
        i < x.targetSequence.contextAgentSpecs.length;
        i++
      ) {
        const contextAgentSpec = x.targetSequence.contextAgentSpecs[i];
        if ( contextAgentSpec.name === this.name ) {
          x.targetPosition$.set(this.after ? i + 1 : i);
          return;
        }
      }

      throw new Error(`could not find '${this.name}' in the target sequence`);
    }
  ]
});
