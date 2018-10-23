foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'ActionObject',

  properties: [
    'name',
    {
      name: 'id',
      class: 'Int'
    },
    {
      name: 'completed',
      class: 'Boolean'
    },
    {
      name: 'act',
      of: 'foam.core.Action'
    },
    {
      name: 'imgObj',
      value: { class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }
    },
    {
      name: 'imgObjCompeleted',
      value: { class: 'foam.u2.tag.Image', data: 'images/canada.svg' }
    },
  ]
});
