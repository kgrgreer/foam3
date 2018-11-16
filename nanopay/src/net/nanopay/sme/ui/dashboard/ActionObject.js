foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'ActionObject',

  documentation: `
    Part of the Ablii dashboard view. Each ActionObject is a step that the user
    needs to complete before being fully onboarded.
  `,

  properties: [
    {
      class: 'Int',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'completed'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.core.Action',
      name: 'act'
    },
    {
      name: 'imgObj',
      value: { class: 'foam.u2.tag.Image', data: 'images/checkmark-large-green.svg' }
    },
    {
      name: 'imgObjCompeleted',
      value: { class: 'foam.u2.tag.Image', data: 'images/canada.svg' }
    }
  ]
});
