foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredUserFields',
  requires: [
    'net.nanopay.fx.interac.model.RequiredAddressFields',
    'net.nanopay.fx.interac.model.RequiredIdentificationFields',
    'net.nanopay.fx.interac.model.RequiredAccountFields',
    'net.nanopay.fx.interac.model.RequiredAgentFields',
    'net.nanopay.fx.interac.model.RequiredContactDetailsFields'
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
      name: 'referenceNumber',
      documentation: 'Reference Number (User ID) at the sending system to identify a user. (The sending system can quote only the reference number in case nanopay has already received the details in an earlier call. Only updates and mandatory fields can be sent in a subsequent call)',
      visibility: foam.u2.Visibility.RO,
      factory: function() { return true; }
    },
    {
      class: 'Boolean',
      name: 'name',
      documentation: 'Name of user',
    },
    {
      class: 'Boolean',
      name: 'linkedReferenceNumber',
      documentation: 'Must be populated in case of Receiver & Must be left blank in case of sender. For receiver, this field must contain the sender Reference Number',
      visibility: foam.u2.Visibility.RO,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredAddressFields',
      name: 'postalAddress',
      factory: function() {
        return this.RequiredAddressFields.create();
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
      factory: function() {
        return this.RequiredAgentFields.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.interac.model.RequiredContactDetailsFields',
      name: 'contactDetails',
      factory: function() {
        return this.RequiredContactDetailsFields.create();
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredAddressFields',
  properties: [
    {
      class: 'Boolean',
      name: 'addressType',
      documentation: 'Possible options: "Structured" | "Unstructured"',
    },
    {
      class: 'Boolean',
      name: 'streetName'
    },
    {
      class: 'Boolean',
      name: 'buildingNumber'
    },
    {
      class: 'Boolean',
      name: 'postCode'
    },
    {
      class: 'Boolean',
      name: 'townName'
    },
    {
      class: 'Boolean',
      name: 'countrySubDivision',
      documentation: 'Region/Province/State eg: "ON"'
    },
    {
      class: 'Boolean',
      name: 'country'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredIdentificationFields',
  properties: [
    {
      class: 'Boolean',
      name: 'birthDate',
    },
    {
      class: 'Boolean',
      name: 'cityOfBirth'
    },
    {
      class: 'Boolean',
      name: 'countryOfBirth'
    },
    {
      class: 'Boolean',
      name: 'documentType'
    },
    {
      class: 'Boolean',
      name: 'documentNumber'
    },
    {
      class: 'Boolean',
      name: 'occupation'
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
    },
    {
      class: 'Boolean',
      name: 'branchIdentification'
    },
    {
      class: 'Boolean',
      name: 'memberIdentification'
    },
    {
      class: 'Boolean',
      name: 'memberCode'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredContactDetailsFields',
  properties: [
    {
      class: 'Boolean',
      name: 'phoneNumber',
    },
    {
      class: 'Boolean',
      name: 'emailAddress'
    }
  ]
});
