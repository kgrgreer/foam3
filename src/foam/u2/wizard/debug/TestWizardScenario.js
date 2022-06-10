/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'TestWizardScenario',
  documentation: `
    Contains an artificial capability DAG to represent a situation which may
    occur in real capability DAGs, intended for use in manual tests of the
    wizard.
  `,

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.Capability',
      name: 'capabilities',
      adapt: function (o, n, prop) {
        n = n.map(o => ({
          ...o,
          name: o.name || foam.String.labelize(o.id)
        }));
        return foam.json.parse(n, prop.of, this.__subContext__)
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.CapabilityCapabilityJunction',
      name: 'capabilityCapabilityJunctions',
      adapt: function (o, n, prop) {
        n = n.map(spec => foam.Array.isInstance(spec) ? {
          sourceId: spec[0],
          targetId: spec[1]
        } : spec);
        return foam.json.parse(n, prop.of, this.__subContext__)
      }
    }
  ],

  methods: [
    function installInSequence (sequence) {}
  ]
});
