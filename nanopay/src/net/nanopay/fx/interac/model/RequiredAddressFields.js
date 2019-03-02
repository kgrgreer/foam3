foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredAddressFields',
  properties: [
    {
      class: 'String',
      name: 'addressType',
      visibility: 'RO',
      value: 'ADDR'
    },
    {
      class: 'Boolean',
      name: 'structured',
      visibility: 'RO',
      documentation: 'Possible options: "Structured" | "Unstructured"',
    },
    {
      class: 'Boolean',
      name: 'streetName',
      visibility: 'RO',
      expression: function(structured) {
        return structured;
      }
    },
    {
      class: 'Boolean',
      name: 'buildingNumber',
      visibility: 'RO',
      expression: function(structured) {
        return structured;
      }
    },
    {
      class: 'Boolean',
      name: 'addressLine1',
      visibility: 'RO',
      expression: function(structured) {
        return ! structured;
      }
    },
    {
      class: 'Boolean',
      name: 'addressLine2',
      visibility: 'RO',
      expression: function(structured) {
        return ! structured;
      }
    },
    {
      class: 'Boolean',
      name: 'postCode',
      visibility: 'RO',
      value: true
    },
    {
      class: 'Boolean',
      name: 'townName',
      visibility: 'RO',
      value: true
    },
    {
      class: 'Boolean',
      name: 'countrySubDivision',
      documentation: 'Region/Province/State eg: "ON"',
      visibility: 'RO',
      value: true
    },
    {
      class: 'Boolean',
      name: 'country',
      visibility: 'RO',
      value: true
    }
  ]
});
