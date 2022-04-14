/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'AssignAnonymousAgent',
  implements: ['foam.core.ContextAgent'],
  documentation: `If session is not authenticated, authenticate with the anonymous user`,

  imports: [
    'auth',
  ],

  exports: [
    'isAnonymous'
  ],

  properties: [
    'isAnonymous'
  ],

  methods: [
    async function execute() {
      try {
        var subject = await this.auth.getCurrentSubject();
        if ( ! subject || ! subject.user ) throw new Error();
        this.isAnonymous = await this.auth.isAnonymous();
        return;
      } catch (e) {
        await this.auth.authorizeAnonymous();
        this.isAnonymous = true;
      }
    }
  ]
});