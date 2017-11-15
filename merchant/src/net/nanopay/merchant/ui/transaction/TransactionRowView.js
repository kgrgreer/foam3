foam.CLASS({
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'TransactionRowView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.merchant.ui.transaction.TransactionDetailView'
  ],

  imports: [
    'stack',
    'user',
    'userDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          height: 70px;
          background-color: #ffffff;
          box-shadow: inset 0 -1px 0 0 #f2f2f2;
        }
        ^ .transaction-item {
          padding-left: 20px;
          padding-right: 20px;
        }
        ^ .transaction-item-icon img {
          position: absolute;
          height: 45px;
          width: 45px;
          border-style: solid;
          border-width: 1px;
          border-color: #f1f1f1;
          border-radius: 50%;
          margin-top: 13px;
          margin-bottom: 13px;
        }
        ^ .transaction-item-name {
          position: absolute;
          font-family: Roboto;
          font-size: 16px;
          line-height: 1;
          text-align: left;
          color: #252c3d;
          padding-top: 22px;
          padding-bottom: 32px;
          padding-left: 65px;
        }
        ^ .transaction-item-datetime {
          position: absolute;
          font-family: Roboto;
          font-size: 10px;
          text-align: left;
          color: #666a86;
          padding-top: 41px;
          padding-bottom: 18px;
          padding-left: 65px;
        }
        ^ .transaction-item-amount {
          position: absolute;
          right: 0px;
          font-size: 20px;
          text-align: right;
          color: #26a96c;
          padding-top: 22px;
          padding-bottom: 19px;
          padding-right: 20px;
        }
        ^ .transaction-item-amount.refund {
          color: #f55a5a;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      self
        .addClass(self.myClass())
        .on('click', self.onClick)
        .call(function () {
          Promise.resolve().then(function () {
            if ( self.data.payerId === self.user.id ) {
              self.data.refund = true;
              return self.userDAO.find(self.data.payeeId);
            } else if ( self.data.payeeId === self.user.id ) {
              return self.userDAO.find(self.data.payerId);
            }
          })
          .then(function (user) {
            self.data.user = user;
            self.start('div').addClass('transaction-item')
              .start().addClass('transaction-item-icon')
                .tag({ class: 'foam.u2.tag.Image', data: user.profilePicture || 'images/ic-placeholder.png' })
              .end()
              .start().addClass('transaction-item-name')
                .add(user.firstName + ' ' + user.lastName)
              .end()
              .start().addClass('transaction-item-datetime')
                .add(self.data.date.toString())
              .end()
              .start().addClass('transaction-item-amount').addClass( self.data.refund ? 'refund' : '')
                .add( '$' + ( self.data.total / 100 ).toFixed(2))
              .end()
            .end();
          });
        });
    }
  ],

  listeners: [
    function onClick (e) {
      this.stack.push(this.TransactionDetailView.create({ data: this.data }));
    }
  ]
})