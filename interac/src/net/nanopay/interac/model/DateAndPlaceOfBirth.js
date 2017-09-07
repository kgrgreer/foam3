foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'DateAndPlaceOfBirth',

  documentation: 'Date and place of birth',

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'Reference',
      name: 'user',
      of: 'foam.nanos.auth.User'
    },
    {
      class: 'String',
      name: 'birthday'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'birthplace'
    }
  ]
});