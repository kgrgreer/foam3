/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.CapabilityCapabilityJunction',

  documentation: `
    Refine capabilitycapabilityjunction to add tablecellformatters for source and target id
  `,

  implements: [
    {
      path: 'foam.mlang.Expressions',
      flags: ['js']
    }
  ],

  properties: [
    {
      class: 'Int',
      name: 'priority'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      name: 'sourceId',
      label: 'Top Level Capability',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Capability',
              dao: X.capabilityDAO
            }
          ]
        };
      },
      projectionSafe: false,
      tableCellFormatter: function(value, obj, _) {
        this.__subContext__.capabilityDAO
          .where(obj.EQ(foam.nanos.crunch.Capability.ID, value))
          .limit(1)
          .select(obj.PROJECTION(foam.nanos.crunch.Capability.NAME))
          .then(async result => {
            let name = await result?.array?.[0]?.toSummary();
            this.add(name || value)
          });
      },
      menuKeys: ['admin.capabilities']
    },
    {
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      name: 'targetId',
      label: 'Dependent',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Capability',
              dao: X.capabilityDAO
            }
          ]
        };
      },
      projectionSafe: false,
      tableCellFormatter: function(value, obj, _) {
        this.__subContext__.capabilityDAO
          .where(obj.EQ(foam.nanos.crunch.Capability.ID, value))
          .limit(1)
          .select(obj.PROJECTION(foam.nanos.crunch.Capability.NAME))
          .then(async result => {
            let name = await result?.array?.[0]?.toSummary();
            this.add(name || value)
          });
      },
      menuKeys: ['admin.capabilities']
    },
    {
      class: 'Boolean',
      name: 'precondition',
      documentation: `
        This property applies to prerequisite capability junctions.

        If a prerequisite is considered a "precondition", it must be granted
        before the corresponding dependant is shown in the capability store.
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      view: { class: 'foam.u2.view.JSONTextView' },
      javaFactory: `
        return foam.mlang.MLang.TRUE;
      `,
      documentation: 'The condition under which this capabilitycapabilityjunction would hold.'
    }
  ]
});
