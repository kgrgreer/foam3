/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'NullEventHandlerAgent',
  implements: [ 'foam.core.ContextAgent' ],

  exports: ['handleEvent'],

  methods: [
    async function execute () {},
    function handleEvent(event) {
      console.debug('event:', event);
    }
  ]
});
