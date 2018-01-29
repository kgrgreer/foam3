foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PurposeOfTransfer',
  ids: [ 'purposeCode' ],
  properties: [
    {
      class: 'String',
      name: 'purposeCode',
      required: true
    },
    {
      class: 'String',
      name: 'classificationName'
    },
    {
      class: 'String',
      name: 'classificationNumber'
    },
    {
      class: 'String',
      name: 'description',
      required: true
    },
    {
      class: 'Boolean',
      name: 'isB2B',
      required: true
    },
    {
      class: 'Boolean',
      name: 'isP2P',
      required: true
    }
  ]
});
