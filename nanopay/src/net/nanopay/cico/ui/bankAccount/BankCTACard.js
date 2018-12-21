foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount',
  name: 'BankCTACard',
  extends: 'net.nanopay.ui.NotificationActionCard',

  documentation: 'Card that would display an alert that would prompt the user to add a bank account.',

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.NotificationActionCard.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  properties: [
    [ 'title',    'Connect your bank account.' ],
    [ 'subTitle', "You don't have any bank accounts yet. You need one to cash out your balance." ]
  ],

  actions: [
    {
      name: 'actionButton',
      label: 'Connect Bank Account',
      code: function(X) {
        // TODO: Go to either bank page or start adding bank flow
      }
    }
  ]
});
