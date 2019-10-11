foam.CLASS({
    package: 'net.nanopay.bank',
    name: 'BankHoliday',
    documentation: 'Payment system must take into account Bank Holidays when determining dates that a Transaction may be expected to complete.',
  
    implements: [
      'foam.mlang.Expressions',
    ],
  
    requires: [
      'foam.nanos.auth.Region'
    ],
  
    properties: [
      {
        class: 'Long',
        name: 'id'
      },
      {
        class: 'String',
        name: 'name',
        documentation: 'Name of the holiday.',
        required: true
      },
      {
        class: 'Date',
        name: 'date',
        documentation: 'Date of the holiday.',
        required: true,
        tableCellFormatter: function(value, obj, axiom) {
          this.add(value.toISOString().substring(0, 10));
        }
      },
      {
        class: 'Reference',
        targetDAOKey: 'countryDAO',
        name: 'countryId',
        of: 'foam.nanos.auth.Country',
        documentation: 'Country address.'
      },
      {
        class: 'Reference',
        targetDAOKey: 'regionDAO',
        name: 'regionId',
        of: 'foam.nanos.auth.Region',
        documentation: 'Region address.',
        view: function (_, X) {
          var choices = X.data.slot(function (countryId) {
            return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryId || ""));
          });
          return foam.u2.view.ChoiceView.create({
            objToChoice: function(region) {
              return [region.id, region.id];
            },
            dao$: choices
          });
        }
      }
    ],
  });
  