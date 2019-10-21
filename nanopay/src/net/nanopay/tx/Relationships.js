foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.TrustAccount',
  targetModel: 'net.nanopay.bank.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'trustAccount',
  cardinality: '1:*',
  targetDAOKey: 'accountDAO',
  unauthorizedTargetDAOKey: 'localAccountDAO',
  targetProperty: {
    view: function(_, X) {
      return foam.u2.view.ChoiceView.create({
        dao: X.accountDAO.where(foam.mlang.MLang.EQ(
          net.nanopay.account.Account.TYPE,
          net.nanopay.account.TrustAccount.class.getSimpleName()
        )),
        placeholder: '--',
        objToChoice: function(account) {
          return [account.id, account.id+'-'+account.name+' ('+account.denomination+')'];
        }
      });
    },
    tableCellFormatter: function(value, obj, axiom) {
      var self = this;
      this.__subSubContext__.accountDAO.find(value)
        .then( function( account ) {
          if ( account ) {
            var displayAccount;
            displayAccount = account.id+'-'+account.name+' ('+account.denomination+')';
            self.add(displayAccount);
            self.tooltip = displayAccount;
          }
        }).catch( function( error ) {
          self.add('N/A');
          console.error(error);
        });
    }
  }
});
