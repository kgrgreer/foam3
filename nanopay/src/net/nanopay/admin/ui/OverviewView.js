foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'OverviewView',
  extends: 'foam.u2.View',

  css: `
    iframe {
      width: 80%;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this.start('h1')
        .add('Nanopay Platform Overview')
      .end()
      .start('iframe').addClass('iframeContainer')
        .attrs({
          'src': 'https://nanopay.net/wp-content/uploads/nanopay-platform-overview.pdf'
        })
      .end();
    }
  ]

});
