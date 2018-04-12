foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredUserFields',
  requires: [
    'net.nanopay.fx.interac.model.RequiredAddressFields',
    'net.nanopay.fx.interac.model.RequiredIdentificationFields',
    'net.nanopay.fx.interac.model.RequiredAccountFields',
    'net.nanopay.fx.interac.model.RequiredAgentFields'
  ],
  properties: [
    {
      class: 'String',
      name: 'userType',
      visibility: foam.u2.Visibility.RO,
      documentation: 'Will be repeated twice, once for the sender and the other for the receiver. Possible values "Sender" | "Receiver"',
      view: function() {
        return foam.u2.view.ChoiceView.create({
          choices: [
            'Sender',
            'Receiver'
          ]
        });
      },
    },
    {
      class: 'Boolean',
      name: 'currency',
      documentation: 'Currency of the Sender (eg: CAD) or Receiver (eg: INR)',
    },
    {
      class: 'Boolean',
      name: 'country',
      documentation: 'Country of the Sender (eg: CA) or Receiver (eg: IN)',
    },
    {
      class: 'Boolean',
      name: 'name',
      documentation: 'Name of user',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredAddressFields',
      name: 'postalAddress',
      expression: function(userType) {
        // NOTE WARNING: This is TEMPORARY and just following the spec
        if ( userType === 'Sender' ) {
          return this.RequiredAddressFields.create({ 'structured': true });
        } else {
          return this.RequiredAddressFields.create({ 'structured': false });
        }

      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredIdentificationFields',
      name: 'identification',
      factory: function() {
        return this.RequiredIdentificationFields.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredAccountFields',
      name: 'account',
      factory: function() {
        return this.RequiredAccountFields.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredAgentFields',
      name: 'agent',
      expression: function(userType) {
        if ( userType === 'Sender' ) {
          return this.RequiredAgentFields.create({ memberCode: 'CACPA' });
        } else {
          return this.RequiredAgentFields.create({ memberCode: 'INFSC' });
        }
      }
    }
  ]
});

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

foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredIdentificationFields',
  requires: [ 'net.nanopay.fx.interac.model.RequiredDocumentFields' ],
  properties: [
    {
      class: 'Boolean',
      name: 'birthDate',
      postSet: function(oldValue, newValue) {
        this.cityOfBirth = newValue;
        this.countryOfBirth = newValue;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'cityOfBirth',
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'countryOfBirth',
      visibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      name: 'identificationDocuments',
      factory: function() {
        return this.RequiredDocumentFields.create();
      }
    },
    {
      class: 'Boolean',
      name: 'occupation'
    },
    {
      class: 'Boolean',
      name: 'phoneNumber',
    },
    {
      class: 'Boolean',
      name: 'emailAddress',
      value: true
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredAccountFields',
  properties: [
    {
      class: 'Boolean',
      name: 'accountNumber',
      visibility: 'RO',
      value: true
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredAgentFields',
  properties: [
    {
      class: 'Boolean',
      name: 'BICFI',
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'branchIdentification',
      expression: function(memberCode) {
        if ( memberCode === 'CACPA' ) return true;
        return false;
      }
    },
    {
      class: 'Boolean',
      name: 'memberId',
      visibility: 'RO',
      value: true
    },
    {
      class: 'String',
      name: 'memberCode',
      visibility: 'RO',
      documentation: 'Set by RequiredUserFields which checks for SENDER || RECEIVER'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredDocumentFields',
  properties: [
    {
      class: 'Boolean',
      name: 'required',
      preSet: function(oldValue, newValue) {
        if ( ! newValue ) {
          this.alienRegistrationNumber = false;
          this.passportNumber = false;
          this.customerIdentificationNumber = false;
          this.driversLicenseNumber = false;
          this.employeeIdentificationNumber = false;
          this.nationalIdentityNumber = false;
          this.socialSecurityNumber = false;
          this.taxIdentificationNumber = false;
        }
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'alienRegistrationNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'passportNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'customerIdentificationNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'driversLicenseNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'employeeIdentificationNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'nationalIdentityNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'socialSecurityNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'taxIdentificationNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    }
  ]
});
