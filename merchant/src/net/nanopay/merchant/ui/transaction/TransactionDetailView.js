foam.CLASS({
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'TransactionDetailView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.merchant.ui.RefundView',
    'net.nanopay.merchant.ui.transaction.TransactionToolbar'
  ],

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 480px;
          background-color: #ffffff;
          position: fixed;
        }
        ^ .transaction-profile {
          display: table;
          width: 320px;
          height: 45px;
          overflow: hidden;
          padding-left: 20px;
          padding-top: 26px;
          padding-bottom: 26px;
        }
        ^ .transaction-profile-icon img {
          height: 45px;
          width: 45px;
          display: table-cell;
          vertical-align: middle;
          border-style: solid;
          border-width: 1px;
          border-color: #f1f1f1;
          border-radius: 50%;
        }
        ^ .transaction-profile-info {
          height: 45px;
          display: table-cell;
          vertical-align: middle;
        }
        ^ .transaction-profile-name {
          font-family: Roboto;
          font-size: 16px;
          line-height: 1;
          text-align: left;
          color: #252c3d;
        }
        ^ .transaction-profile-datetime {
          font-family: Roboto;
          font-size: 16px;
          text-align: left;
          color: #848484;
          padding-top: 10px;
        }
        ^ .transaction-info {
          font-family: Roboto;
          font-size: 16px;
          line-height: 1;
          text-align: left;
          color: #252c3d;
        }
        ^ .transaction-info-wrapper {
          width: 320px;
          height: 40px;
          padding-left: 20px;
          padding-right: 20px;
          padding-bottom: 15px;
        }
        ^ .transaction-info-label {
          float: left;
          padding-top: 12px;
          padding-bottom: 12px;
        }
        ^ .transaction-info-value {
          width: 175px;
          height: 16px;
          border-radius: 2px;
          border: solid 1px #f1f1f1;
          margin-left: 75px;
          padding-left: 30px;
          padding-top: 12px;
          padding-bottom: 12px;
        }
        ^ .transaction-refund {
          position: fixed;
          bottom: 0px;
        }
        ^ .transaction-refund-button {
          width: 320px;
          height: 72px;
          background-color: #f55a5a;
        }
      */}
    })
  ],

  properties: [
    'user'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var user = this.data.user;

      this
        .addClass(this.myClass())
        .add(this.TransactionToolbar.create())
        .start('div').addClass('transaction-profile')
          .start().addClass('transaction-profile-icon')
            .tag({ class: 'foam.u2.tag.Image', data: user.profilePicture || 'images/ic-placeholder.png' })
          .end()
          .start('div').addClass('transaction-profile-info')
            .start().addClass('transaction-profile-name')
              .add(user.firstName + ' ' + user.lastName)
            .end()
            .start().addClass('transaction-profile-datetime')
              .add(this.data.date.toString())
            .end()
          .end()
        .end()
        .start('div').addClass('transaction-info')
          .start('div').addClass('transaction-info-wrapper')
            .start().addClass('transaction-info-label')
              .add('Amount')
            .end()
            .start().addClass('transaction-info-value')
              .add('$' + ( this.data.amount / 100 ).toFixed(2))
            .end()
          .end()
          .start('div').addClass('transaction-info-wrapper')
            .start().addClass('transaction-info-label')
              .add('Tip')
            .end()
            .start().addClass('transaction-info-value')
              .add('$' + ( this.data.tip / 100).toFixed(2))
            .end()
          .end()
          .start('div').addClass('transaction-info-wrapper')
            .start().addClass('transaction-info-label')
              .add('Total')
            .end()
            .start().addClass('transaction-info-value')
              .add('$' + ( this.data.total / 100).toFixed(2))
            .end()
          .end()
        .end()

      if ( ! this.data.refund ) {
        this.start('div').addClass('transaction-refund')
          .start('button').addClass('transaction-refund-button')
            .add('Refund')
            .on('click', this.onRefundClicked)
          .end()
        .end()
      }
    }
  ],

  listeners: [
    function onRefundClicked (e) {
      this.stack.push(this.RefundView.create({ data: this.data }));
    }
  ]
});