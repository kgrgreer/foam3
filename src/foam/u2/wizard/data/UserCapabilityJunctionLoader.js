/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'UserCapabilityJunctionLoader',
  implements: [ 'foam.u2.wizard.data.Loader' ],

  documentation: `
    Will load ucj data into wizardlet.
  `,

  imports: [
    'crunchService',
    'subject',
    'wizardletId',
    'wizardlets'
  ],

  properties: [
    {
      class: 'String',
      name: 'capabilityId'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'loadFromPath',
      documentation: 'Path property of ucj data to return, if not set (default) return ucj data itself'
    }
  ],

  methods: [
    async function load({ old }) {
      const ucj = await (this.subject ? this.crunchService.getJunctionFor(
        null, this.capabilityId, this.subject.user, this.subject.realUser
      ) : this.crunchService.getJunction(null, this.capabilityId));

      return this.loadFromPath ? this.loadFromPath.f(ucj.data) : ucj.data;
    }
  ]
});
