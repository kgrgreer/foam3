/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'ReturnToLaunchPointAgent',
  flags: ['web'],
  documentation: `
  Handle route changes on wizard close
  `,

  imports: [
    'currentMenu',
    'ctrl'
  ],

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    async function execute() {
      if ( this.currentMenu.id === this.ctrl.route ) {
        window.history.back();
      }
    }
  ]
});
