foam.CLASS({
  package: 'net.nanopay.crossborder.model',
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
      class: 'FObjectArray',
      of: 'nnet.nanopay.model.Currency',
      name: 'currencies',
      required: true
    }
  ]
});
