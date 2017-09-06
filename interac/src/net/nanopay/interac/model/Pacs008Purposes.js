foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'Pacs008IndiaPurpose',

  documentation: 'Pacs.008 India Purpose Codes',

  ids: [ 'code' ],

  properties: [
    {
      class: 'String',
      name: 'type',
      required: true
    },
    {
      class: 'Long',
      name: 'grNo',
      required: true
    },
    {
      class: 'String',
      name: 'groupName',
      required: true
    },
    {
      class: 'String',
      name: 'code',
      required: true
    },
    {
      class: 'String',
      name: 'description',
      required: true
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'Pacs008ISOPurpose',

  documentation: 'Pacs.008 ISO Purpose Codes',

  ids: [ 'code' ],

  properties: [
    {
      class: 'String',
      name: 'type',
      required: true
    },
    {
      class: 'String',
      name: 'code',
      required: true
    },
    {
      class: 'String',
      name: 'classification',
      required: true
    },
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'definition',
      required: true
    }
  ]
});
