foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'Payee',

  documentation: 'Transaction recipient',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'middleName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name:  'nationalId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.common.model.Phone',
      name:  'phone'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name:  'address'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.common.model.Account',
      name:  'account'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'Pacs008IndiaPurpose',

  documentation: 'Pacs.008 India Purpose Codes',

  properties: [
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
      name: 'classification1',
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

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.interac.model.Payee',
  forwardName: 'payees',
  inverseName: 'payer'
});
