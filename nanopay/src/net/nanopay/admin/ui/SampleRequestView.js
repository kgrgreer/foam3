foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'SampleRequestView',
  extends: 'foam.u2.View',

  // requires: [
  //   ''
  // ],

  methods: [
    function initE() {
      this.SUPER();

      this.start()
        .start()
          .add('Sample Requests')
        .end()

        .start()
          .add('The following are curl examples of the most common endpoint within the nanopay system.')
        .end()
      .end();
    }
  ]
});
