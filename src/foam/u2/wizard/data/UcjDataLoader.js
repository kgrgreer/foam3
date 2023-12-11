/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'UcjDataLoader',
  implements: [ 'foam.u2.wizard.data.Loader' ],

  documentation: 'Loader to copy data value from a UCJ',

  imports: [
    'crunchService'
  ],

  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  properties: [
    {
      class: 'String',
      name: 'capabilityId'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'loadFromPath',
      documentation: 'UCJ data value to be copied from'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'loadIntoPath',
      documentation: 'Wizardlet data property to be set'
    }
  ],

  methods: [
    async function load({ old }) {
      const data = this.delegate ? await this.delegate.load({ old }) : old;
      if ( ! this.loadIntoPath || this.loadIntoPath.f(data) )
        return data;

      const ucj = await this.crunchService.getJunction(null, this.capabilityId);
      if ( ucj && ucj.status === this.CapabilityJunctionStatus.GRANTED ) {
        const value = this.loadFromPath ? this.loadFromPath.f(ucj.data) : ucj.data;
        if ( value )
          this.loadIntoPath$set(data, value);
      }
      return data;
    }
  ]
});
