foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TransferView',
  extends: 'foam.u2.Controller',

  documentation: "View to Transfer Amounts From User to User",

  requires: [
    'net.nanopay.model.Account',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.Transaction',
    'foam.u2.dialog.NotificationMessage'
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
          width: 100%;
          height: 40px;
        }
        ^ .white-container{
          width: 450px;
          height: 350px;
          margin: auto;
          margin-top: 50px;
        }
        ^ .half-small-input-box{
          width: 100%;
        }
        ^ .light-roboto-h2{
          margin-left: 150px;
          margin-bottom: 15px;
        }
        ^ .btn{
          margin-top: 25px;
        }
        ^ .property-note {
          height: auto;
        }
      */}
    })
  ],

  properties: [
    'payee',
    'transferAmount',
    {
      class: 'String',
      name: 'note',
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 80 }
    },
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
        .start().addClass('white-container')
          .startContext({ data: this})
            .start().addClass('light-roboto-h2').add('Transfer Value').end()
            .start().addClass('label').add('Transfer To:').end()
            .start(this.PAYEES).end()
            .start().addClass('label').add('Transfer Amount:').end()
            .start(this.TRANSFER_AMOUNT).addClass('half-small-input-box').end()
            .start().addClass('label').add('Note:').end()
            .start(this.NOTE).addClass('half-small-input-box').end()
            .start(this.TRANSFER_VALUE).addClass('blue-button btn').end()
          .endContext()
        .end()
      .end();
    }
  ],

  actions:[
    {
      name: 'transferValue',
      label: 'Send',
      confirmationRequired: true,
      code: function(X){
        var self = this;

        if(!X.user.id || !this.transferAmount) {
          this.add(this.NotificationMessage.create({ message: 'Please complete form.', type: 'error'}));          
          return;
        }
        var transaction = this.Transaction.create({
          payeeId: this.payees,
          payerId: X.user.id,
          amount: this.transferAmount,
          notes: this.note
        });

        X.transactionDAO.put(transaction).then(function(t){
          self.add(self.NotificationMessage.create({ message: 'Transfer Successful' }));
          self.transferAmount = null;
        }).catch(function(err){
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
