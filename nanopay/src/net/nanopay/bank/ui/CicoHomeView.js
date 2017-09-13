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
        .end();
    }
  ],

  messages: [],

  actions: [],

  classes: []
})