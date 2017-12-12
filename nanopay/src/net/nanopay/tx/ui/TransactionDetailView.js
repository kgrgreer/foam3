foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'TransactionDetailView',
  extends: 'foam.u2.View',

  documentation: 'Transaction detail view.',

  properties: [
    'data'
  ],

  css: `
  
  `,

  methods:[
    function initE(){
      this
      .addClass(this.myClass())
      .start()
        .add('transaction detail view')
      .end();
    }
  ]
});