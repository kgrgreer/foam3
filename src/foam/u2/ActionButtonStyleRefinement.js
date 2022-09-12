foam.CLASS({
  package: 'foam.u2',
  name: 'ActionButtonStyleRefinement',
  refines: 'foam.core.Action',

  properties: [
    // Upgrade buttonStyle property to enum
    {
      class: 'Enum',
      of: 'foam.u2.ButtonStyle',
      name: 'buttonStyle'
    }
  ]
});
