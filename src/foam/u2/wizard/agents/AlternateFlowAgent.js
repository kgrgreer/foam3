/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'AlternateFlowAgent',
  implements: [
    'foam.core.ContextAgent'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.AlternateFlow',
      name: 'alternateFlow'
    }
  ],

  methods: [
    async function execute() {
      this.alternateFlow.execute(this.__context__);
    }
  ]
});
