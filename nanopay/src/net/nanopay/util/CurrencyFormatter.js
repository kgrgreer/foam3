foam.CLASS({
  package: 'net.nanopay.util',
  name: 'CurrencyFormatter',

  exports: [ 'formatCurrency' ],

  methods: [
    function formatCurrency(a){
      if ( typeof a != 'number' ) {
        return a;
      }
      if ( a >= 1000000000 ) {
          return '$' + (a / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
      }
      if ( a >= 1000000 ) {
          return '$' + (a / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      }
      if ( a >= 1000 ) {
          return '$' + (a / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      }
      return '$' + a.toFixed(2);
    }
  ]
});