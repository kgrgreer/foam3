foam.CLASS({
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'TransactionDetailView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.merchant.ui.RefundView'
  ],

  imports: [
    'stack',
    'toolbarIcon',
    'toolbarTitle'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 100%;
          height: 100%;
          background-color: #ffffff;
        }
        ^ .transaction-profile {
          display: table;
          height: 45px;
          overflow: hidden;
          padding-left: 20px;
          padding-top: 13px;
          padding-bottom: 26px;
        }
        ^ .transaction-profile-icon img {
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
          padding-left: 20px;
        }
        ^ .transaction-profile-name {
          line-height: 1;
          text-align: left;
          color: #252c3d;
        }
        ^ .transaction-profile-datetime {
          font-size: 16px;
          text-align: left;
          color: #848484;
          padding-top: 10px;
        }
        ^ .transaction-info {
          line-height: 1;
          text-align: left;
          color: #252c3d;
        }
        ^ .transaction-info-wrapper {
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
          border-radius: 2px;
          border: solid 1px #f1f1f1;
          padding-left: 30px;
          padding-top: 12px;
          padding-bottom: 12px;
        }
        ^ .transaction-refund {
          width: 100%;
          position: fixed;
          bottom: 0px;
        }
        ^ .transaction-refund-button {
          width: 100%;
          height: 72px;
          background-color: #f55a5a;
        }

        ^ .transaction-refunded-button {
          width: 100%;
          height: 72px;
          background-color: #848484;
        }
        @media only screen and (min-width: 0px) {
          ^ .transaction-profile {
            height: 45px;
          }
          ^ .transaction-profile-info {
            height: 45px;
          }
          ^ .transaction-profile-icon img {
            height: 45px;
            width: 45px;
          }
          ^ .transaction-profile-name {
            font-size: 16px;
          }
          ^ .transaction-profile-datetime {
            font-size: 10px;
          }
          ^ .transaction-info {
            font-size: 16px;
          }
          ^ .transaction-info-wrapper {
            height: 40px;
          }
          ^ .transaction-info-value {
            height: 16px;
            margin-left: 76px;
          }
        }
        @media only screen and (min-width: 768px) {
          ^ .transaction-profile {
            height: 85px;
          }
          ^ .transaction-profile-info {
            height: 85px;
          }
          ^ .transaction-profile-icon img {
            height: 85px;
            width: 85px;
          }
          ^ .transaction-profile-name {
            font-size: 26px;
          }
          ^ .transaction-profile-datetime {
            font-size: 20px;
          }
          ^ .transaction-info {
            font-size: 26px;
          }
          ^ .transaction-info-wrapper {
            height: 60px;
          }
          ^ .transaction-info-value {
            height: 26px;
            margin-left: 128px;
          }
        }
        @media only screen and (min-width: 1024px) {
          ^ .transaction-profile {
            height: 124px;
          }
          ^ .transaction-profile-info {
            height: 124px;
          }
          ^ .transaction-profile-icon img {
            height: 124px;
            width: 124px;
          }
          ^ .transaction-profile-name {
            font-size: 36px;
          }
          ^ .transaction-profile-datetime {
            font-size: 30px;
          }
          ^ .transaction-info {
            font-size: 36px;
          }
          ^ .transaction-info-wrapper {
            height: 80px;
          }
          ^ .transaction-info-value {
            height: 36px;
            margin-left: 180px;
          }
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.toolbarTitle = 'Back';
      this.toolbarIcon = 'arrow_back';

      var user = this.data.user;
      this
        .addClass(this.myClass())
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

      if ( this.data.status != 'Refunded' && this.data.status != 'Refund' ) {
        this.start('div').addClass('transaction-refund')
          .start('button').addClass('transaction-refund-button')
            .add('Refund')
            .on('click', this.onRefundClicked)
          .end()
        .end()
      } else {
        this.start('div').addClass('transaction-refund')
          .start('button').addClass('transaction-refunded-button')
            .add('Refunded')
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
