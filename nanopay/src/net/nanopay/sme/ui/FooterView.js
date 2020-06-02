foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'FooterView',
  extends: 'foam.u2.Controller',

  documentation: 'View to display footer view.',

  imports: [
    'theme'
  ],

  css: `
    ^ {
      width: 100vw;
      height: 65px;
      margin: auto;
      color: white;
      display: flex;
      align-items: center;
      z-index: 949;
      position: fixed;
      bottom: 0;
      justify-content: flex-end;
      background-color: /*%PRIMARY1%*/ #2e2379;
    }
    ^ .appConfig-info {
      display: flex;
    }
    ^ div {
      margin: 0 20px;
    }
    ^ a { 
      color: white;
    }
  `,

  messages: [
    { name: 'CONTACT_SUPPORT', message: 'Contact Support' },
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
          .start().add(this.CONTACT_SUPPORT).end()
          .add(this.slot((theme) => {
            return this.E().addClass('appConfig-info')
              .start('a')
                .attrs({ href: 'mailto:' + theme.supportEmail })
                .add(theme.supportEmail)
              .end()
              .start().add(theme.supportPhone).end();
          }))
        .end();
    },
  ]
});
