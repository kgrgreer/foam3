foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'OverviewView',
  extends: 'foam.u2.View',

  css: `
    ^ {
      width: 992px;
      margin: auto;
    }
    iframe {
      width: 80%;
      height: 75vh;
    }
    h1 {
      margin-bottom: 40px;
    }
  `,

  messages: [
    {
      name: 'Title',
      message: 'Nanopay Platform Overview (PDF)'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.start().addClass(this.myClass())
        .start('h1')
          .add(this.Title)
        .end()
        .start('iframe').addClass('iframeContainer')
          .attrs({
            'src': 'https://nanopay.net/wp-content/uploads/nanopay-platform-overview.pdf'
          })
        .end()
      .end();
    }
  ]

});
