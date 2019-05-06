foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'TopBarBackToAblii',
  extends: 'foam.u2.Controller',

  documentation: 'Top bar view for redirecting to ablii.com',

  css: `
    ^ .net-nanopay-sme-ui-TopBarBackToAblii-button{
      position: relative;
      top: 20px;
      cursor: pointer;
    }
  `,

  messages: [
    { name: 'GO_BACK', message: 'Back to ablii.com' },
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).addClass('full-screen')
      .start().addClass('top-bar')
        .start().addClass('top-bar-inner')
          .start().addClass(this.myClass('button'))
            .start()
              .addClass('horizontal-flip')
              .addClass('inline-block')
              .add('➔')
            .end()
            .add(this.GO_BACK)
            .on('click', () => {
              window.location = 'https://www.ablii.com';
            })
          .end()
        .end()
      .end();
    }
  ]
});
