foam.CLASS({
  package: 'net.nanopay.account',
  name: 'ShadowAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.bank.BankAccount',
      targetDAOKey: 'accountDAO',
      name: 'bank',
      section: 'accountDetails',
      view: function(args, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.ReferenceView',
          dao: X.accountDAO.where(E.INSTANCE_OF(net.nanopay.bank.BankAccount)).orderBy(net.nanopay.account.Account.NAME),
          objToChoice: function(c) {
            return [c.id, c.name];
          }
        };
      }
    }
  ]
});

