foam.CLASS({
  package: 'net.nanopay.util',
  name: 'AddCommaFormatter',

  exports: [ 'addCommas' ],

  methods: [
    function addCommas(a) {
      return a.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  ]
});