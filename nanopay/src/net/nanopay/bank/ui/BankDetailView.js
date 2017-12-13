foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankDetailView',
  extends: 'foam.u2.View',

  documentation: 'View displaying selected bank.',
  
  properties: [
    {
      name: 'selectedUserAccount'
    }
  ],

  css: `
    ^ {
      width: 962px;
      margin: 0 auto;
    }
  `,

  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      
      this
        .addClass(this.myClass())
        .tag({ class: 'net.nanopay.ui.BalanceView', data: this.account });
    }
  ]
});
