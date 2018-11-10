foam.CLASS({
  package: 'net.nanopay.model',
  name: 'PersonalIdentification',

  documentation: 'User/Personal identification.',

  properties: [
    {
      class: 'Reference',
      targetDAOKey: 'identificationTypeDAO',
      name: 'identificationTypeId',
      of: 'net.nanopay.model.IdentificationType',
      documentation: `Identification details for individuals/users.`
    },
    {
      class: 'String',
      name: 'identificationNumber',
      documentation: `Number associated to identification.`
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      of: 'foam.nanos.auth.Country',
      documentation: `Country where identification was issued.`
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
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      }
    },
    {
      class: 'Date',
      name: 'issueDate',
      documentation: `Date identification was issued.`
    },
    {
      class: 'Date',
      name: 'expirationDate',
      documentation: `Date identification expires.`
    }
  ]
});
