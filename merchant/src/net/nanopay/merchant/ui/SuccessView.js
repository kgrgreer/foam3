foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'SuccessView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Success screen after payment / refund',

  imports: [
    'stack'
  ],

  requires: [
    'foam.u2.stack.Stack',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 100%;
          height: 100%;
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
          height: 45px;
          width: 45px;
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
    ['header', false],
    { name: 'refund', class: 'Boolean' }
  ],

  messages: [
    { name: 'paymentSuccess', message: 'Money Collected Successfully' },
    { name: 'refundSuccess',  message: 'Money Refunded Successfully' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var user = this.data.user;

      this.document.addEventListener('keydown', this.onKeyPressed);
      this.onDetach(function () {
        self.document.removeEventListener('keydown', self.onKeyPressed);
      });

      this
        .addClass(this.myClass())
        .start('div').addClass('success-view-div')
          .start('div').addClass('success-icon')
            .tag({class: 'foam.u2.tag.Image', data: 'images/ic-success.png' })
          .end()
          .start().addClass('success-message').add( ! this.refund ? this.paymentSuccess : this.refundSuccess ).end()
          .start().addClass('success-amount').add('$' + ( this.data.amount / 100 ).toFixed(2)).end()
          .start().addClass('success-from-to').add( ! this.refund ? 'From' : 'To' ).end()
          .start().addClass('success-profile')
            .start().addClass('success-profile-icon')
              .tag({ class: 'foam.u2.tag.Image', data: user.profilePicture || 'images/ic-placeholder.png' })
            .end()
            .start().addClass('success-profile-name')
              .add(user.firstName + ' ' + user.lastName)
            .end()
          .end()
        .end();
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      var key = e.key || e.keyCode;
      if ( key === 'Enter' || key === 13 ) {
        // reset nav items
        var sidenavs = document.getElementsByClassName('sidenav-list-item');
        sidenavs[1].classList.add('selected');
        sidenavs[2].classList.remove('selected');
        this.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
      }
    }
  ]
})