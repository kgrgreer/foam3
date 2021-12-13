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
    'rootCapability',
    'subject'
  ],
  exports: [
    'capabilities'
  ],

  properties: [
    {
      name: 'capabilities',
      class: 'Array',
      documentation: `This array can consist of capabilities
      and arrays of capabilities.`
    }
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    function execute() {
      console.log("@LoadCapabilities - created context in subject - " + (this.subject ? this.subject.user.id : "-") + " real: " + (this.subject ? this.subject.realUser.id : "-") );
      
      return this.crunchService.getCapabilityPathFor(null, this.rootCapability.id, false, this.subject.user, this.subject.realUser)
        .then(capabilities => this.capabilities = capabilities);
    }
  ]
});
