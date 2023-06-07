/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'LoadCapabilitiesAgent',
  implements: [ 'foam.core.ContextAgent' ],

  documentation: `
    Calls crunchService to fetch the necessary prerequisie capabilities.
  `,

  imports: [
    'crunchService',
    'rootCapability'
  ],
  exports: [
    'capabilities',
    'subject as wizardSubject'
  ],

  properties: [
    {
      name: 'capabilities',
      class: 'Array',
      documentation: `This array can consist of capabilities
      and arrays of capabilities.`
    },
    {
      name: 'subject',
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      documentation: `
        The requested subject associated to the ucj. Should only be set
        when used by a permissioned back-office user.
      `
    }
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    async function execute() {
      if ( this.subject ) {
        await this.crunchService.getCapabilityPathFor(null, this.rootCapability.id, false, this.subject.user, this.subject.realUser)
          .then(capabilities => this.capabilities = capabilities);
        return;
      }
      await this.crunchService.getCapabilityPath(null, this.rootCapability.id, false, true)
        .then(capabilities => this.capabilities = capabilities);
    }
  ]
});
