foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'LineItemTypeAccount',
  implements: ['foam.nanos.auth.EnabledAware'],

  documentation: 'Payee, LineItemType, Deposit Account association',

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
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      required: true,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.userDAO,
          objToChoice: function(o) {
            return [o.id, o.legalName];
          }
        });
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'type',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.lineItemTypeDAO,
          objToChoice: function(o) {
            return [o.id, o.name];
          }
        });
      },
      required: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      required: true,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO,
          objToChoice: function(o) {
            return [o.id, o.name+' / '+o.description+' ('+o.type+')'];
          }
        });
      }
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of service or good.'
    }
  ]
});
