foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniName',

  documentation: `The name object for SIDni`,

  properties: [
    {
      class: 'String',
      name: 'firstName',
      required: true,
      validateObj: function(firstName) {
        if ( firstName.length > 50 ) {
          return 'First name cannot be greater than 50 characters.';
        }
      }
    },
    {
      class: 'String',
      name: 'middleName',
      validateObj: function(middleName) {
      if ( middleName.length > 50 ) {
        return 'Middle name cannot be greater than 50 characters.';
      }
    }
    },
    {
      class: 'String',
      name: 'lastName',
      required: true,
      validateObj: function(lastName) {
        if ( lastName.length > 50 ) {
          return 'Last name cannot be greater than 50 characters.';
        }
      }
    },
    {
      class: 'String',
      name: 'suffix',
      documentation: `Individual's name suffix`,
      validateObj: function(suffix) {
        if ( ('JR', 'SR', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VII', 'IX').indexOf(suffix) > -1 ) {
          return;
        }
        return 'Invalid Suffix.';
        }
    }
  ]
});
