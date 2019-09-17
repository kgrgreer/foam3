foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankHolidayWeekendModifiers',

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryId',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          placeholder: 'Select a Country',
          defaultValue: 'Select a Country'
        });
      }
    },
    {
      class: 'Reference',
      targetDAOKey: 'regionDAO',
      name: 'regionId',
      label: 'Region',
      of: 'foam.nanos.auth.Region',
      view: function(_, X) {
        var choices = X.data.slot(function(countryId) {
          return X.regionDAO.where(this.EQ(foam.nanos.auth.Region.COUNTRY_ID, countryId || ''));
        });
        return foam.u2.view.ChoiceView.create({
          placeholder: 'Select a Region',
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.bank.BankHolidayEnum',
      name: 'bankHolidayEnum'
    },
  ],

});
