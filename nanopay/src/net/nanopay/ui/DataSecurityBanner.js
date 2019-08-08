foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'DataSecurityBanner',
  extends: 'foam.u2.View',

  css: `
    ^ {
      width: 456px;
      height: 56px;
      border: 1px solid /*%GREY5%*/ #f5f7fa;
      border-radius: 3px;
      background-color: white;
      padding: 12px 13px;
      box-sizing: border-box;
    }

    ^image {
      display: inline-block;
      vertical-align: middle;
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }

    ^text-container {
      display: inline-block;
      vertical-align: middle;
    }

    ^text-container p {
      margin: 0;
      font-size: 10px;
    }

    ^title {
      font-weight: 900;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^subtitle {
      color: #8e9090;
    }
  `,

  messages: [
    { name: 'Title', message: 'Your safety is our top priority' },
    { name: 'Subtitle', message: 'Ablii uses state-of-the-art security and encryption measures when handling your data' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start({ class: 'foam.u2.tag.Image', data: 'images/security-icon.svg' }).addClass(this.myClass('image')).end()
        .start('div').addClass(this.myClass('text-container'))
          .start('p').add(this.Title).addClass(this.myClass('title')).end()
          .start('p').add(this.Subtitle).addClass(this.myClass('subtitle')).end()
        .end()
    }
  ]
});
