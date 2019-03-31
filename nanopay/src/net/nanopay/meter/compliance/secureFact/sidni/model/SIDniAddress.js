foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniAddress',

  documentation: `Represents SIDni address`,

  properties: [
    {
      class: 'String',
      name: 'addressType',
      required: true,
      documentation: 'Type of address, Current or Former'
    },
    {
      class: 'String',
      name: 'addressLine',
      required: true,
      documentation: `Individual's street address. example: 1531 King Street`
    },
    {
      class: 'String',
      name: 'city',
      required: true
    },
    {
      class: 'String',
      name: 'province',
      required: true
    },
    {
      class: 'String',
      name: 'postalCode',
      required: true
    },
    {
      class: 'String',
      name: 'country',
      documentation: 'Only CA is supported right now',
      value: 'CA'
    }
  ]
});
