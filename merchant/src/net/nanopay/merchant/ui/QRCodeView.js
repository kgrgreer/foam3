foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'QRCodeView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.util.ChallengeGenerator'
  ],

  requires: [
    'net.nanopay.merchant.ui.SuccessView',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'user',
    'stack',
    'tipEnabled',
    'toolbarIcon',
    'toolbarTitle',
    'transactionDAO',
    'userDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          background-color: #2c4389;
          position: relative;
        }
        ^ .qr-code-wrapper-div {
          background-color: #ffffff;
          width: 180px;
          height: 180px;
          position: absolute;
          left: 70px;
          top: 20px;
        }
        ^ .amount-div {
          font-size: 25px;
          font-weight: 500;
          text-align: center;
          position: absolute;
          top: 220px;
          width: 320px;
        }
        ^ .instructions-div {
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          position: absolute;
          top: 279px;
          width: 320px;
        }
        ^ .qr-code-div:focus {
          outline: none;
        }
      */}
    })
  ],

  properties: [
    ['header', true],
    { class: 'Currency', name: 'amount' }
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

      var challenge = this.generateChallenge();

      // add a listener for the payee id and amount
      var sub = this.transactionDAO.where(this.AND(
        this.EQ(this.Transaction.PAYEE_ID, this.user.id),
        this.EQ(this.Transaction.AMOUNT, this.amount),
        this.EQ(this.Transaction.CHALLENGE, this.challenge)
      )).listen({ put: this.onTransactionCreated });

      // detach listener when view is removed
      this.onunload.sub(function () {
        sub.detach();
      });

      this.document.addEventListener('keydown', this.onKeyPressed);
      this.onDetach(function () {
        self.document.removeEventListener('keydown', self.onKeyPressed);
      });

      this
        .addClass(this.myClass())
        .start('div')
          .addClass('qr-code-wrapper-div')
          .start('div').addClass('qr-code-div').end()
        .end()
        .start('span')
        .start('div').addClass('amount-div')
          .add('$' + ( this.amount / 100 ).toFixed(2))
        .end()
        .start('div').addClass('instructions-div')
          .add(this.instruction1).br()
          .add(this.instruction2).br()
          .add(this.instruction3).br()
        .end()

      var QRC = qrcodegen.QrCode;
      var qr0 = QRC.encodeText(JSON.stringify({
        payeeId: self.user.id,
        amount: self.amount,
        challenge: challenge,
        tip: self.tipEnabled
      }), QRC.Ecc.MEDIUM);

      this.onload.sub(function () {
        var wrapper = document.querySelector('.qr-code-wrapper-div');
        wrapper.innerHTML = qr0.toSvgString(4);
      });
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      var key = e.key || e.keyCode;
      if ( key === 'Backspace' || key === 27 || key === 8  ) {
        this.toolbarTitle = 'MintChip Home';
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
          self.stack.push(self.SuccessView.create({ refund: false, data: obj }));
        })
      }
    }
  ]
})
