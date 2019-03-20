foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev.model',
  name: 'LEVRequest',

  properties: [
    {
      class: 'String',
      name: 'searchType',
      required: true,
      documentation: 'Performs search against entityName or entityNumber',
      validateObj: function(searchType) {
        if ( searchType === 'name' || searchType === 'number' ) {
          return;
        }
        return 'Must be name or number';
      }
    },
    {
      class: 'String',
      name: 'entityName',
      documentation: 'Max 350 characters. This or entityNumber is required.',
      validateObj: function(entityName) {
        if ( entityName.length > 350 ) {
            return 'First name has a max length of 350.';
        }
      }
    },
    {
      class: 'String',
      name: 'entityNumber',
      documentation: 'Max 50 characters. This or entityName is required.',
      validateObj: function(entityNumber) {
        if ( entityNumber.length > 50 ) {
            return 'First name has a max length of 50.';
        }
      }
    },
    {
      class: 'String',
      name: 'country',
      required: true,
      documentation: 'CA only.',
      value: 'CA'
    },
    {
      class: 'String',
      name: 'jurisdiction',
      required: true,
      documentation: 'Jurisdiction where search should be conducted. CD = Canada federal.',
      validateObj: function(jurisdiction, entityNumber, entityName) {
        if ( entityNumber ) {
          if ( ['ON', 'QC', 'AB', 'BC', 'SK', 'MB', 'NB', 'NS', 'NL', 'PE', 'YT', 'NT', 'NU', 'CD'].indexOf(jurisdiction) > -1 ) {
            return;
          }
        } else if ( entityName ) {
          if ( ['ON', 'QC', 'AB', 'BC', 'SK', 'MB', 'NB', 'NS', 'NL', 'PE', 'YT', 'NT', 'NU', 'CD', 'ALL'].indexOf(jurisdiction) > -1 ) {
            return;
          }
        }
        return 'Invalid Jurisdiction.';
      }
    },
    {
      class: 'String',
      name: 'customerReference',
      documentation: 'Identifier for the transaction from customer.',
      validateObj: function(customerReference) {
        if ( customerReference.length > 75 ) {
          return 'Customer reference has a max length of 75.';
        }
      }
    },
    {
      class: 'String',
      name: 'formationDate',
      documentation: 'Entity formation date.',
      validateObj: function(formationDate) {
        var regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
        if ( ! regex.match(dateOfBirth) ) {
          return 'Invalid formation date format. YYYY-MM-DD required.';
        }
      }
    },
    {
      class: 'String',
      name: 'entityType',
      documentation: 'Entity type of the entity',
      validateObj: function(entityType) {
        if ( searchType === 'Corporation' || searchType === 'Sole Proprietorship' || searchType === 'Partnership' || searchType === 'Trade Name' ) {
          return;
        }
        return 'Invalid entity type.';
      }
    },
    {
      class: 'String',
      name: 'address',
      documentation: 'Reccomended postal code only.',
      validateObj: function(address) {
        if ( address.length > 150 ) {
          return 'Address is over 150 character max length.';
        }
      }
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVApplicant',
      name: 'applicant',
      documentation: 'Can only have 1 entry, but an array is required.',
      validateObj: function(applicant) {
        if ( applicant.length < 2 ) {
          return 'Max 1 applicant';
        }
      }
    }
  ]
  });
