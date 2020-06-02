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
      tableCellFormatter: function(value, _, _) {
        this.__subContext__.capabilityDAO
          .find(value)
          .then((result) => {
            this.add(result.name);
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
      tableCellFormatter: function(value, _, _) {
        this.__subContext__.capabilityDAO
          .find(value)
          .then((result) => {
            this.add(result.name);
          });
      }
    }
  ]
});
