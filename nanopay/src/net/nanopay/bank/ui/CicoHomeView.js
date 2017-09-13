foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'CicoHomeView',
  extends: 'foam.u2.View',

  documentation: 'View for displaying all Top Up and Cash Out Transactions as well as account Balance',

  requires: [],

  imports: [],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 962px;
          margin: 0 auto;
        }
        ^ .balanceBox {
          width: 330px;
          height: 100px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
        }
        ^ .greenBar {
          width: 6px;
          height: 100px;
          background-color: #23c2b7;
          float: left;
        }
        ^ .balanceBoxTitle {
          color: #093649;
          font-size: 12px;
        }
        ^ .balance {
          font-size: 30px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.5px;
          text-align: left;
          color: #093649;
        }
        ^ .foam-u2-ActionView-topUpBtn {
          width: 135px;
          height: 50px;
          border-radius: 2px;
          background-color: #59a5d5;
          color: white;
          margin: 0;
          padding: 0;
          border: 0;
          outline: none;
          cursor: pointer;
          line-height: 50px;
          font-size: 14px;
        }
        ^ .foam-u2-ActionView-cashOutBtn {
          width: 135px;
          height: 50px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1);
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          color: #093649;
          margin: 0;
          padding: 0;
          border: 0;
          outline: none;
          cursor: pointer;
          line-height: 50px;
          font-size: 14px;
        }
      */}
    })
  ],

  properties: [],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('div').addClass('balanceBox')
            .start('div').addClass('greenBar').end()
            .start('h5').add(this.balanceTitle).end()
          .end()
        .end();
    }
  ],

  messages: [
    { name: 'balanceTitle', message: 'Balance' }
  ],

  actions: [
    {
      name : 'topUpBtn',
      label : 'Top Up',
      code: function(X) {
        // TODO: open top up modal
      }
    },
    {
      name: 'cashOutBtn',
      label: 'Cash Out',
      code: function(X) {
        // TODO: open cash out modal
      }
    }

  ],

  classes: []
})