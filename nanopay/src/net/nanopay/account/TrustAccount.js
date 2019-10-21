foam.CLASS({
  package: 'net.nanopay.account',
  name: 'TrustAccount',
  extends: 'net.nanopay.account.ZeroAccount',

  javaImports: [
    'net.nanopay.account.Account',
    'foam.core.X',
  ],

  properties: [
    {
      documentation: 'The Trust account mirrors a real world reserve account, or an Account in another nanopay realm.',
      name: 'reserveAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    }
  ],
});
