/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.RefundTransaction'
  ],

  css: `
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
    ^ .success-message {
      font-weight: 300;
      text-align: left;
      padding-top: 30px;
    }
    ^ .success-amount {
      font-weight: bold;
      text-align: left;
      padding-top: 7px;
    }
    ^ .success-from-to {
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
    ^ .foam-nanos-auth-ProfilePictureView {
      display: table-cell;
      vertical-align: middle;
    }
    ^ .foam-nanos-auth-ProfilePictureView .boxless-for-drag-drop {
      height: auto;
      padding: 10px;
      margin: 0;
      background-color: transparent;
      border: none;
    }
    ^ .foam-nanos-auth-ProfilePictureView .boxless-for-drag-drop img {
      border-style: solid;
      border-width: 1px;
      border-color: #f1f1f1;
      border-radius: 50%;
    }
    ^ .success-profile-name {
      line-height: 1.88;
      text-align: center;
      color: #ffffff;
      display: table-cell;
      vertical-align: middle;
      padding-left: 20px;
    }

    @media only screen and (min-width: 0px) {
      ^ .success-icon img {
        height: 76px;
        width: 76px;
      }
      ^ .success-message {
        font-size: 32px;
      }
      ^ .success-amount {
        font-size: 32px;
      }
      ^ .success-from-to {
        font-size: 12px;
      }
      ^ .foam-nanos-auth-ProfilePictureView,
      ^ .foam-nanos-auth-ProfilePictureView .boxless-for-drag-drop,
      ^ .foam-nanos-auth-ProfilePictureView .boxless-for-drag-drop img {
        height: 45px;
        width: 45px;
      }
      ^ .success-profile-name {
        font-size: 16px;
      }
    }

    @media only screen and (min-width: 768px) {
      ^ .success-icon img {
        height: 176px;
        width: 176px;
      }
      ^ .success-message {
        font-size: 42px;
      }
      ^ .success-amount {
        font-size: 42px;
      }
      ^ .success-from-to {
        font-size: 22px;
      }
      ^ .foam-nanos-auth-ProfilePictureView,
      ^ .foam-nanos-auth-ProfilePictureView .boxless-for-drag-drop,
      ^ .foam-nanos-auth-ProfilePictureView .boxless-for-drag-drop img {
        height: 85px;
        width: 85px;
      }
      ^ .success-profile-name {
        font-size: 26px;
      }
    }

    @media only screen and (min-width: 1024px) {
      ^ .success-icon img {
        height: 276px;
        width: 276px;
      }
      ^ .success-message {
        font-size: 52px;
      }
      ^ .success-amount {
        font-size: 52px;
      }
      ^ .success-from-to {
        font-size: 32px;
      }
      ^ .foam-nanos-auth-ProfilePictureView,
      ^ .foam-nanos-auth-ProfilePictureView .boxless-for-drag-drop,
      ^ .foam-nanos-auth-ProfilePictureView .boxless-for-drag-drop img {
        height: 124px;
        width: 124px;
      }
      ^ .success-profile-name {
        font-size: 36px;
      }
    }
  `,

  properties: [
    'refresh',
    ['header', false],
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
    { name: 'paymentSuccess', message: 'Money Collected Successfully' },
    { name: 'refundSuccess', message: 'Money Refunded Successfully' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.document.addEventListener('keyup', this.onKeyPressed);
      this.document.addEventListener('touchend', this.onTouchStarted);
      this.onDetach(function() {
        self.document.removeEventListener('keyup', self.onKeyPressed);
        self.document.removeEventListener('touchend', self.onTouchStarted);
      });

      // if not a refund, use the total; else use amount
      var refund = this.transaction.type === 'RefundTransaction';
      var amount = ! refund ?
        this.transaction.total : this.transaction.amount;

      this
        .addClass(this.myClass())
        .start('div').addClass('success-view-div')
          .start('div').addClass('success-icon')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-success.svg' })
          .end()
          .start().addClass('success-message')
            .add(! refund ? this.paymentSuccess : this.refundSuccess)
          .end()
          .start().addClass('success-amount')
            .add('$' + (amount / 100).toFixed(2))
          .end()
          .start().addClass('success-from-to')
            .add(! refund ? 'From' : 'To')
          .end()
          .start().addClass('success-profile')
            .start().addClass('success-profile-icon')
              .tag({
                class: 'foam.nanos.auth.ProfilePictureView',
                ProfilePictureImage$: this.transactionUser.profilePicture$,
                placeholderImage: 'images/ic-placeholder.png',
                uploadHidden: true,
                boxHidden: true
              })
            .end()
            .start().addClass('success-profile-name')
              .add(this.transactionUser.firstName + ' ' + this.transactionUser.lastName)
            .end()
          .end()
        .end();

      this.refresh = setTimeout(function() {
        self.showHomeView();
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
    function onKeyPressed(e) {
      e.preventDefault();
      var key = e.key || e.keyCode;
      if ( key === 'Backspace' || key === 'Enter' ||
        key === 'Escape' || key === 8 || key === 13 || key === 27 ) {
        clearTimeout(this.refresh);
        this.showHomeView();
      }
    },

    function onTouchStarted(e) {
      e.preventDefault();
      clearTimeout(this.refresh);
      this.showHomeView();
    }
  ]
});
