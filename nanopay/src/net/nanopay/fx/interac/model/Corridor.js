foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'Corridor',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Region',
      name: 'region',
      required: true
    },
    {
      class: 'Array',
      of: 'Long',
      name: 'currencies',
      required: true
    }
  ]
});
