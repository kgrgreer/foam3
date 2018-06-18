foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'CurrencyChoice',
  extends: 'foam.u2.View',

  imports: [
    'currencyDAO'
  ],

  properties: [
    'selection',
    {
      name: 'dao',
      expression: function(currencyDAO) {
        return currencyDAO;
      },
      view: 'foam.u2.DAOList'
    }
  ],

  css: `
  
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
      .start()
       .add(this.SELECTION)
      .end()
      .start()
        .add(this.DAO)
      .end();
    }
  ]
});
