foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BusinessDirector',

  documentation: `
    A business director is a person from a group of managers who leads or
    supervises a particular area of a company.
  `,

  properties: [
    {
      class: 'String',
      name: 'firstName',
      gridColumns: 6,
      minLength: 1
    },
    {
      class: 'String',
      name: 'lastName',
      gridColumns: 6,
      minLength: 1
    }
  ]
});
