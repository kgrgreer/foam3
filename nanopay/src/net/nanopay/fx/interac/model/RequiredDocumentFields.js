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
