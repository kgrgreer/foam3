foam.CLASS({
  package: 'net.nanopay.ingenico.ui',
  name: 'HomeView',
  extends: 'foam.u2.View',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 480px;
          background-color: #2c4389;
        }
        ^ .amount-label {
          height: 30px;
          font-family: Roboto;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          padding-top: 58px;
        }
        ^ .amount-field {
          height: 88px;
          font-family: Roboto;
          font-size: 75px;
          text-align: center;
          color: #ffffff;
          padding-top: 14px;
        }
      */}
    })
  ],

  properties: [
    { name: 'amount', class: 'String', value: '$0.00'}
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().addClass('amount-label').add('Amount')
        .start().addClass('amount-field').add(this.amount)
    }
  ]
})