foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'ErrorView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Error screen after payment / refund',

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          height: 100%;
          width: 100%;
          background-color: #f55a5a;
          margin-top: -56px;
        }
        ^ .error-view-div {
          padding-top: 70px;
          padding-left: 36px;
        }
        ^ .error-message {
          font-weight: 300;
          text-align: left;
          padding-top: 30px;
        }
        ^ .error-amount {
          font-weight: bold;
          text-align: left;
          padding-top: 7px;
        }
        ^ .error-from-to {
          text-align: left;
          color: rgba(255, 255, 255, 0.7);
          padding-top: 50px;
        }
        ^ .error-profile {
          display: table;
          height: 40px;
          overflow: hidden;
          padding-top: 10px;
        }
        ^ .error-profile-icon img {
          height: 45px;
          width: 45px;
          display: table-cell;
          vertical-align: middle;
          border-style: solid;
          border-width: 1px;
          border-color: #f1f1f1;
          border-radius: 50%;
        }
        ^ .error-profile-name {
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          display: table-cell;
          vertical-align: middle;
          padding-left: 20px;
        }
        @media only screen and (min-width: 0px) {
          ^ .error-icon img {
            height: 76px;
            width: 76px;
          }
          ^ .error-message {
            font-size: 32px;
          }
          ^ .error-amount {
            font-size: 32px;
          }
          ^ .error-from-to {
            font-size: 12px;
          }
          ^ .error-profile-icon img {
            height: 45px;
            width: 45px;
          }
          ^ .error-profile-name {
            font-size: 16px;
          }
        }
        @media only screen and (min-width: 768px) {
          ^ .error-icon img {
            height: 176px;
            width: 176px;
          }
          ^ .error-message {
            font-size: 42px;
          }
          ^ .error-amount {
            font-size: 42px;
          }
          ^ .error-from-to {
            font-size: 22px;
          }
          ^ .error-profile-icon img {
            height: 85px;
            width: 85px;
          }
          ^ .error-profile-name {
            font-size: 26px;
          }
        }
        @media only screen and (min-width: 1024px) {
          ^ .error-icon img {
            height: 276px;
            width: 276px;
          }
          ^ .error-message {
            font-size: 52px;
          }
          ^ .error-amount {
            font-size: 52px;
          }
          ^ .error-from-to {
            font-size: 32px;
          }
          ^ .error-profile-icon img {
            height: 124px;
            width: 124px;
          }
          ^ .error-profile-name {
            font-size: 36px;
          }
        }
      */}
    })
  ],

  properties: [
    'refresh',
    ['header', false],
    ['showHome', false],
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'transactionUser'
    }
  ],

  messages: [
    { name: 'paymentError', message: 'Payment failed. Please try again' },
    { name: 'refundError',  message: 'Refund failed. Please try again' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.document.addEventListener('keyup', this.onKeyPressed);
      this.document.addEventListener('touchend', this.onTouchStarted);
      this.onDetach(function () {
        self.document.removeEventListener('keyup', self.onKeyPressed);
        self.document.removeEventListener('touchend', self.onTouchStarted);
      });

      var user = this.transactionUser;
      // if not a refund, use the total; else use amount
      var refund = ( this.transaction.status === 'Refund' );
      var amount = ( ! refund ) ?
        this.transaction.total :
        this.transaction.amount;

      this
        .addClass(this.myClass())
        .start('div').addClass('error-view-div')
          .start('div').addClass('error-icon')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-error.svg' })
          .end()
          .start().addClass('error-message').add( ! refund ? this.paymentError : this.refundError ).end()
          .start().addClass('error-amount').add('$' + ( amount / 100 ).toFixed(2)).end()
          .start().addClass('error-from-to').add( ! refund ? 'From' : 'To' ).end()
          .start().addClass('error-profile')
            .start('div').addClass('error-profile-icon')
              .tag({ class: 'foam.u2.tag.Image', data: user.profilePicture || 'images/ic-placeholder.png' })
            .end()
            .start().addClass('error-profile-name')
              .add(user.firstName + ' ' + user.lastName)
            .end()
          .end()
        .end();

      this.refresh = setTimeout(function () {
        if ( self.showHome ) {
          self.showHomeView();
        } else {
          self.stack.back();
        }
      }, 4000);
    },

    function showHomeView() {
      // reset nav items
      var sidenavs = document.getElementsByClassName('sidenav-list-item');
      sidenavs[1].classList.add('selected');
      sidenavs[2].classList.remove('selected');
      this.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      var key = e.key || e.keyCode;
      if ( key === 'Backspace' || key === 'Enter' || key === 'Escape' || key === 8 || key === 13 || key === 27 ) {
        e.preventDefault();
        clearTimeout(self.refresh);
        if ( this.showHome ) {
          this.showHomeView();
        } else {
          this.stack.back();
        }
      }
    },

    function onTouchStarted (e) {
      e.preventDefault();
      clearTimeout(this.refresh);
      if ( this.showHome ) {
        this.showHomeView();
      } else {
        this.stack.back();
      }
    }
  ]
})