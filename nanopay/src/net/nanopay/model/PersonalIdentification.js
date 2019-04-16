foam.CLASS({
  package: 'net.nanopay.model',
  name: 'PersonalIdentification',

  documentation: 'User/Personal identification.',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.auth.Region',
    'net.nanopay.model.IdentificationType'
  ],

  imports: [
    'regionDAO',
    'identificationTypeDAO'
  ],

  properties: [
    {
      class: 'Reference',
      targetDAOKey: 'identificationTypeDAO',
      name: 'identificationTypeId',
      of: 'net.nanopay.model.IdentificationType',
      documentation: `Identification details for individuals/users.`,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.identificationTypeDAO.where(X.data.NEQ(X.data.IdentificationType.NAME, 'Provincial ID Card')),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      },
      validateObj: function(identificationTypeId) {
        if ( ! identificationTypeId ) {
          return 'Identification type is required';
        }
      }
    },
    {
      class: 'String',
      name: 'identificationNumber',
      documentation: `Number associated to identification.`,
      validateObj: function(identificationNumber) {
        if ( ! identificationNumber.trim() ) {
          return 'Identification number is required';
        }
      }
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country',
      documentation: `Country where identification was issued.`,
      validateObj: function(countryId) {
        if ( ! countryId ) {
          return 'Country of issue is required';
        }
      }
    },
    {
      class: 'Reference',
      targetDAOKey: 'regionDAO',
      name: 'regionId',
      of: 'foam.nanos.auth.Region',
      documentation: `Region where identification was isssued.`,
      view: function(_, X) {
        var choices = X.data.slot(function(countryId) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryId || ''));
        });
        return foam.u2.view.ChoiceView.create({
          placeholder: '- Please select -',
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      },
      validateObj: function(regionId, identificationTypeId) {
        var isPassport = identificationTypeId === 3;
        if ( ! regionId && ! isPassport ) {
          return 'Region of issue is required';
        }
      }
    },
    {
      class: 'Date',
      name: 'issueDate',
      documentation: `Date identification was issued.`,
      validateObj: function(issueDate) {
        if ( ! issueDate ) {
          return 'Date issued is required';
        }
      }
    },
    {
      class: 'Date',
      name: 'expirationDate',
      documentation: `Date identification expires.`,
      validateObj: function(expirationDate) {
        if ( ! expirationDate ) {
          return 'Expiry date is required';
        }
      }
    }
  ]
});
