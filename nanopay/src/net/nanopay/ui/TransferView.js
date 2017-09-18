foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TransferView',
  extends: 'foam.u2.View',

  documentation: "View to Transfer Amounts From User to User",

  requires: [
    'net.nanopay.model.Account',
    'foam.nanos.auth.User'
  ],

  imports: [
    'user',
    'userDAO',
    'bankAccountDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 992px;
          margin: auto;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'payees',
      postSet: function(oldValue, newValue) {
        var self = this;
        this.userDAO.where(this.EQ(this.User.ID, newValue)).select().then(function(a){
          var user = a.array[0];
        });
      },
      view: function(_,X) {
        return foam.u2.view.ChoiceView.create({
          dao: this.userDAO,
          objToChoice: function(user) {
            var username = user.firstName + ' ' + user.lastName;
            if ( X.data.mode == 'Organization' ) {
              // if organization exists, change name to organization name.
              if ( user.organization ) username = user.organization;
            }
            return [user.id, username + ' - (' + user.email + ')'];
          }
        });
      }
    },
    {
      name: 'accounts',
      postSet: function(oldValue, newValue) {
        var self = this;
        this.bankAccountDAO.where(this.EQ(this.Account.ID, newValue)).select().then(function(a){
          var account = a.array[0];
        });
      },
      view: function(_,X) {
        return foam.u2.view.ChoiceView.create({
          dao: this.bankAccountDAO.where(this.EQ(this.Account.ID, 1)),
          objToChoice: function(account) {
            return [account.id, 'Account No. ' +
                                account.accountInfo.accountNumber//'***' + account.accountInfo.accountNumber.substring(account.accountInfo.accountNumber.length - 4, account.accountInfo.accountNumber.length)
                    ]; // TODO: Grab amount and display
          }
        });
      }
    },
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
      .start().addClass(this.myClass())
      .start().addClass('light-roboto-h2').add('Transfer Value').end()
      .start().addClass('label').add('Transfer To:').end()
      .start(this.PAYEES).addClass('half-small-input-box').end()
      .start().addClass('label').add('Select Account').end()
      .start(this.ACCOUNTS).addClass('half-small-input-box').end()
      .end()
    }
  ],

  listeners:[
  ],
});
