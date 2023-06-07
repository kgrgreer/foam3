/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'PrerequisiteCapabilityJunctionRefine',
  refines: 'foam.nanos.crunch.CapabilityCapabilityJunction',

  documentation: `
    A refinement of CapabilityCapabilityJunction for prerequisiteCapabilityJunctions where
    a property 'priority' of class int is added to provide order of precedence for prerequisite capabilities
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      name: 'priority',
      class: 'Int'
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
          .then((result) => {
            if ( ! result || result.array.size < 1 || ! result.array[0]) {
              this.add(value);
              return;
            }
            this.add(result.array[0]);
          });
      }
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
          .then((result) => {
            if ( ! result || result.array.size < 1 || ! result.array[0]) {
              this.add(value);
              return;
            }
            this.add(result.array[0]);
          });
      },
      menuKeys: ['admin.capabilities']
    }
  ]
});