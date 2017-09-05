foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'User',

  documentation: 'User information.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'postalAddress'
    },
    {
      class: 'String',
      name: 'addressType'
    },
    {
      class: 'String',
      name: 'streetName'
    },
    {
      class: 'String',
      name: 'buildingNumber'
    },
    {
      class: 'String',
      name: 'postCode'
    },
    {
      class: 'String',
      name: 'townName'
    },
    {
      class: 'String',
      name: 'countrySubdivision'
    },
    {
      class: 'String',
      name: 'Country'
    },
    {
      class: 'String',
      name: 'addressLine'
    },
    {
      class: 'String',
      name: 'Identification'
    },
    {
      class: 'String',
      name: 'privateIdentification'
    },
    {
      class: 'String',
      name: 'dateAndPlaceOfBirth'
    },
    {
      class: 'Date',
      name: 'BirthDate'
    },
    {
      class: 'String',
      name: 'provinceOfBirth'
    },
    {
      class: 'String',
      name: 'cityOfBirth'
    },
    {
      class: 'String',
      name: 'countryOfBirth'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'Agent',

  documentation: 'Financial Institution acting as Agent.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'financialInstitutionIdentification'
    },
    {
      class: 'String',
      name: 'BICFI'
    },
    {
      class: 'String',
      name: 'clearingSystemMemberIdentification'
    },
    {
      class: 'String',
      name: 'clearingSystemIdentification'
    },
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'memberIdentification'
    },
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'postalAddress'
    },
    {
      class: 'String',
      name: 'addressType'
    },
    {
      class: 'String',
      name: 'streetName'
    },
    {
      class: 'String',
      name: 'buildingNumber'
    },
    {
      class: 'String',
      name: 'postCode'
    },
    {
      class: 'String',
      name: 'townName'
    },
    {
      class: 'String',
      name: 'countrySubdivision'
    },
    {
      class: 'String',
      name: 'country'
    },
    {
      class: 'String',
      name: 'addressLine'
    },
    {
      class: 'String',
      name: 'branchIdentification'
    },
    {
      class: 'String',
      name: 'identification'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.interac.model',
  name: 'Pacs008Purpose',

  documentation: 'Pacs.008 Purpose Codes',

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

/* foam.Relationship examples...

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.interac.model.Business',
  targetModel: 'net.nanopay.interac.model.Business',
  forwardName: 'partners',
  inverseName: 'partnered',
  cardinality: '*:*'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.interac.model.Business',
  targetModel: 'net.nanopay.common.model.Address',
  forwardName: 'addresses',
  inverseName: 'businessId',
  sourceProperty: {
    hidden: true
  }
}); */
