foam.CLASS({
  package: 'net.nanopay.ingenico.ui',
  name: 'SuccessView',
  extends: 'foam.u2.View',

  imports: [
    'toolbar'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          height: 480px;
          width: 320px;
          background-color: #35c38d;
          margin-top: -56px;
        }
        ^ .success-view-div {
          padding-top: 70px;
          padding-left: 36px;
        }
        ^ .success-icon img {
          height: 76px;
          width: 76px;
        }
        ^ .success-message {
          font-family: Roboto;
          font-size: 32px;
          font-weight: 300;
          text-align: left;
          padding-top: 30px;
        }
        ^ .success-amount {
          font-family: Roboto;
          font-size: 32px;
          font-weight: bold;
          text-align: left;
          padding-top: 7px;
        }
        ^ .success-from-to {
          font-family: Roboto;
          font-size: 12px;
          text-align: left;
          color: rgba(255, 255, 255, 0.7);
          padding-top: 50px;
        }
        ^ .success-profile {
          display: table;
          height: 40px;
          overflow: hidden;
          padding-top: 10px;
        }
        ^ .success-profile-icon img {
          height: 40px;
          width: 40px;
          display: table-cell;
          vertical-align: middle;
          border-style: solid;
          border-width: 1px;
          border-color: #f1f1f1;
          border-radius: 50%;
        }
        ^ .success-profile-name {
          font-family: Roboto;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          display: table-cell;
          vertical-align: middle;
          padding-left: 20px;
        }
      */}
    })
  ],

  properties: [
    { name: 'refund', class: 'Boolean' }
  ],

  messages: [
    { name: 'paymentSuccess', message: 'Money Collected Successfully' },
    { name: 'refundSuccess',  message: 'Money Refunded Successfully' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('success-view-div')
          .start('div').addClass('success-icon')
            .tag({class: 'foam.u2.tag.Image', data: 'images/ic-success.png' })
          .end()
          .start().addClass('success-message').add( ! this.refund ? this.paymentSuccess : this.refundSuccess ).end()
          .start().addClass('success-amount').add(this.data.amount).end()
          .start().addClass('success-from-to').add( ! this.refund ? 'From' : 'To' ).end()
          .start().addClass('success-profile')
            .start().addClass('success-profile-icon')
              .tag({ class: 'foam.u2.tag.Image', data: this.data.image })
            .end()
            .start().addClass('success-profile-name').add(this.data.name).end()
          .end()
        .end();

      this.onload.sub(function () {
        this.toolbar.classList.add('hidden');
      });
    }
  ]
})