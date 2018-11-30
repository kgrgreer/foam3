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
