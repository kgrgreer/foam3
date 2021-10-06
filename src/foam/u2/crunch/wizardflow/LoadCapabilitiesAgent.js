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
    'caps as capabilities',
    'subject as wizardSubject'
  ],

  properties: [
    {
      name: 'caps',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.Capability',
      factory: function() {
        if ( this.capabilities.length > 0 ) this.caps = this.capabilities;
      }
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
    function execute() {
      if ( this.subject ) {
        return this.crunchService.getCapabilityPathFor(null, this.rootCapability.id, false, this.subject.user, this.subject.realUser)
          .then(capabilities => this.caps = capabilities);
      }
      return this.crunchService.getCapabilityPath(null, this.rootCapability.id, false, true)
        .then(capabilities => this.caps = capabilities);
    }
  ]
});
