foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'QRCodeView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.util.ChallengeGenerator'
  ],

  requires: [
    'net.nanopay.merchant.ui.ErrorView',
    'net.nanopay.merchant.ui.SuccessView',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'user',
    'device',
    'stack',
    'userDAO',
    'tipEnabled',
    'toolbarIcon',
    'toolbarTitle',
    'transactionSuccessDAO',
    'transactionErrorDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 100%;
          height: 100%;
          display: table;
          position: absolute;
          background-color: %PRIMARYCOLOR%;
          margin-top: -56px;
        }
        ^ .wrapper {
          display: table-cell;
          vertical-align: middle;
        }
        ^ .qr-code-wrapper {
          width: 100%;
        }
        ^ .qr-code {
          background-color: %PRIMARYCOLOR%;
          margin: 0 auto;
        }
        ^ .qr-code:focus {
          outline: none;
        }
        ^ .amount-div {
          width: 100%;
          font-weight: 500;
          text-align: center;
          position: relative;
          margin-top: 30px;
        }
        ^ .instructions-div {
          width: 100%;
          line-height: 1.88;
          text-align: center;
          position: relative;
          margin-top: 20px;
        }

        @media only screen and (min-height: 0px) {
          ^ .qr-code {
            width: 180px;
            height: 180px;
          }
          ^ .amount-div {
            font-size: 25px;
          }
          ^ .instructions-div {
            font-size: 16px;
          }
        }

        @media only screen and (min-height: 667px) {
          ^ .qr-code {
            width: 240px;
            height: 240px;
          }
          ^ .amount-div {
            font-size: 35px;
          }
          ^ .instructions-div {
            font-size: 21px;
          }
        }
        @media only screen and (min-height: 768px) {
          ^ .qr-code {
            width: 300px;
            height: 300px;
          }
          ^ .amount-div {
            font-size: 45px;
          }
          ^ .instructions-div {
            font-size: 26px;
          }
        }
        @media only screen and (min-height: 1024px) {
          ^ .qr-code {
            width: 360px;
            height: 360px;
          }
          ^ .amount-div {
            font-size: 55px;
          }
          ^ .instructions-div {
            font-size: 31px;
          }
        }
        @media only screen and (min-height: 1366px) {
          ^ .qr-code {
            width: 420px;
            height: 420px;
          }
          ^ .amount-div {
            font-size: 65px;
          }
          ^ .instructions-div {
            font-size: 36px;
          }
        }
      */}
    })
  ],

  properties: [
    ['header', true],
    {
      class: 'Currency',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'challenge',
      factory: function () {
        return this.generateChallenge();
      }
    }
  ],

  messages: [
    { name: 'instruction1', message: '1. Open MintChip App' },
    { name: 'instruction2', message: '2. Tap Pay Merchant' },
    { name: 'instruction3', message: '3. Scan QR Code' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarIcon = 'arrow_back';
      this.toolbarTitle = 'Back';

      // add a listener for the payee id and amount
      var successSub = this.transactionSuccessDAO.where(this.AND(
        this.EQ(this.Transaction.PAYEE_ID, this.user.id),
        this.EQ(this.Transaction.DEVICE_ID, this.device.id),
        this.EQ(this.Transaction.AMOUNT, this.amount),
        this.EQ(this.Transaction.CHALLENGE, this.challenge)
      )).listen({ put: this.onTransactionCreated });

      var errorSub = this.transactionErrorDAO.where(this.AND(
        this.EQ(this.Transaction.PAYEE_ID, this.user.id),
        this.EQ(this.Transaction.DEVICE_ID, this.device.id),
        this.EQ(this.Transaction.AMOUNT, this.amount),
        this.EQ(this.Transaction.CHALLENGE, this.challenge)
      )).listen({ put: this.onTransactionError });

      this.document.addEventListener('keydown', this.onKeyPressed);
      this.onDetach(function () {
        successSub.detach(); // detach success listener when view is removed
        errorSub.detach(); // detach error listener when view is removed
        self.document.removeEventListener('keydown', self.onKeyPressed);
      });

      this
        .addClass(this.myClass())
        .start('div').addClass('wrapper')
          .start('div').addClass('qr-code-wrapper')
            .start('div').addClass('qr-code').end()
          .end()
          .start('div').addClass('amount-div')
            .add('$' + ( this.amount / 100 ).toFixed(2))
          .end()
          .start('div').addClass('instructions-div')
            .add(this.instruction1).br()
            .add(this.instruction2).br()
            .add(this.instruction3).br()
          .end()
        .end()

      var worker = new Worker('libs/qrcode/qrcode.js');
      worker.addEventListener('message', function (e) {
        var wrapper = self.document.querySelector('.qr-code');
        wrapper.innerHTML = e.data;
      }, false);

      worker.postMessage(JSON.stringify({
        payeeId: self.user.id,
        deviceId: self.device.id,
        amount: self.amount,
        challenge: self.challenge,
        tip: self.tipEnabled
      }));
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      var key = e.key || e.keyCode;
      if ( key === 'Backspace' || key === 27 || key === 8  ) {
        this.toolbarTitle = 'Home';
        this.toolbarIcon = 'menu';
        this.stack.back();
      }
    },
    {
      name: 'onTransactionCreated',
      code: function (obj, s) {
        var self = this;

        this.userDAO.find(obj.payerId)
        .then(function (user) {
          obj.user = user;
          self.stack.push(self.SuccessView.create({
            refund: false,
            data: obj
          }));
        });
      }
    },
    {
      name: 'onTransactionError',
      code: function (obj, s) {
        var self = this;

        this.userDAO.find(obj.payerId)
        .then(function (user) {
          obj.user = user;
          self.stack.push(self.ErrorView.create({
            refund: false,
            showHome: true,
            data: obj
          }));
        });
      }
    }
  ]
})
