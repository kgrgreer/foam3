foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BusinessSector',

  documentation: 'General section in the economy within' +
      ' which groups of companies can be categorized.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of business sector.'
    },
    {
      class: 'Long',
      name: 'parent'
    }
  ],

  method: [
    {
      name: 'toSummary',
      documentation: `
        When using a reference to the BusinessSectorDAO, the labels associated to it will show a chosen property
        rather than the first alphabetical string property. In this case, we are using the business sector name.
      `,
      code: function(x) {
        var self = this;
        return this.name;
      },
    },
  ]
});
