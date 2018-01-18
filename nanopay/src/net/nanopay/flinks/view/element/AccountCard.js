foam.CLASS({
  package: 'net.nanopay.flinks.view.element',
  name: 'AccountCard',
  extends: 'foam.u2.View',

  documentation: 'view for account and balance',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 451px;
          height: 57px;
          border: solid 1px #dce0e7;
        }
        ^ .leftPart {
          display: inline-block;
          width: 200px;
        }
        ^ .rightPart {
          display: inline-block;
          width: 155px;
          vertical-align: top;
        }
        ^ .accountName {
          font-family: Roboto;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.33;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
        }
        ^ p {
          margin: 0;
          padding: 0;
        }
        ^ .accountNo {
          font-family: Roboto;
          font-size: 12px;
          letter-spacing: 0.3px;
          text-align: left;
          color: rgba(9, 54, 73, 0.7);
        }
        ^ .balance {
          width: 100%;
          height: 30px;
          font-family: Roboto;
          font-size: 20px;
          font-weight: 300;
          line-height: 1.5;
          letter-spacing: 0.3px;
          text-align: right;
          color: #093649;
        }
      */}
    })
  ],

  properties: [
    'accountName',
    'accountNo',
    {
      class: 'Double',
      name: 'balance'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('leftPart').style({'margin-left':'44px'})
          .start('p').addClass('accountName').style({'margin-top':'8px'}).add(this.accountName$).end()
          .start('p').addClass('accountNo').style({'margin-top':'4px'}).add('Account No. ').add(this.accountNo$).end()
        .end()
        .start('div').addClass('rightPart').style({'margin-left':'22px'})
          .start('p').addClass('balance').style({'margin-top':'11px'}).add('$').add(this.balance$).end()
        .end()
    }
  ]
})