foam.CLASS({
  package: 'net.nanopay.admin.ui.shared',
  name: 'CurrencyFormatter',

  methods: [
    function format(a){
      if ( typeof a != 'number' ) {
        return a;
      }
      if ( a >= 1000000000 ) {
          return '$' + (a / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
      }
      if ( a >= 1000000 ) {
          return '$' + (a / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      }
      if ( a >= 1000 ) {
          return '$' + (a / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      }
      return '$' + a;
    }
  ]
})
