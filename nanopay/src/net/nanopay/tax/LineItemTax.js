foam.CLASS({
  package: 'net.nanopay.tax',
  name: 'LineItemTax',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Region'
  ],

  tableColumns: [
    'id', 'taxType', 'rate', 'countryId', 'regionId'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 50,
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'String',
      name: 'taxCode',
      required: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'forType',
      documentation: 'LineItem type. e.g Service or Expense.',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.lineItemTypeDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'taxType',
      documentation: 'Type of tax. Could be VAT',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.lineItemTypeDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      class: 'Double',
      name: 'rate',
      tableCellFormatter: function(amount, X) {
        this
          .start()
          .add(amount, '%')
          .end();
      }
    },
    {
      class: 'Reference',
      name: 'countryId',
      of: 'foam.nanos.auth.Country',
      documentation: 'Country address.',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      class: 'Reference',
      targetDAOKey: 'regionDAO',
      name: 'regionId',
      of: 'foam.nanos.auth.Region',
      documentation: 'Region address.',
      view: function(_, X) {
        var choices = X.data.slot(function(countryId) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryId || ""));
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
      class: 'Boolean',
      name: 'refundable',
      value: false
    }
  ],

  methods: [
    {
      name: 'getTaxAmount',
      args: [
        {
          name: 'transactionAmount',
          type: 'Long',
        }
      ],
      type: 'Long',
      javaCode: `
      return ((Double) (this.getRate()/100.0 * transactionAmount)).longValue();
      `,
      code: function() {
        return this.rate/100 * transactionAmount;
      }
    }
  ]
});
