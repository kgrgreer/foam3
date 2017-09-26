foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TransferView',
  extends: 'foam.u2.Controller',

  documentation: "View to Transfer Amounts From User to User",

  requires: [
    'net.nanopay.model.Account',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.Transaction'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 992px;
          margin: auto;
        }
        ^ .label{
          margin-top: 15px;
        }
        ^ .foam-u2-tag-Select{
          width: 215px;
          height: 40px;
        }
      */}
    })
  ],

  properties: [
    'payee',
    'transferAmount',
    {
      name: 'payees',
      view: function(_,X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.userDAO,
          objToChoice: function(user) {
            var username = user.firstName + ' ' + user.lastName;
            return [user.id, username + ' - (' + user.email + ')'];
          }
        });
      }
    }
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
      .start().addClass(this.myClass())
        .start().addClass('light-roboto-h2').add('Transfer Value').end()
        .start().addClass('label').add('Transfer To:').end()
        .start(this.PAYEES).end()
        .start().addClass('label').add('Transfer Amount').end()
        .start(this.TRANSFER_AMOUNT).addClass('half-small-input-box').end()
        .start(this.TRANSFER_VALUE).addClass('blue-button').end()
      .end();
    }
  ],

  actions:[
    {
      name: 'transferValue',
      label: 'Send',
      code: function(X){
        var self = this;

        var transaction = this.Transaction.create({
          payeeId: this.payees,
          payerId: X.user.id,
          amount: X.transferAmount
        });

        X.transactionDAO.put(transaction);
      }
    }
  ]
});
