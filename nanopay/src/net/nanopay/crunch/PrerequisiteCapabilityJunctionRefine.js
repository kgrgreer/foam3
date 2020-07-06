/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.crunch',
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
    }
  ]
});
