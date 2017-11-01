foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'AboutView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  imports: [
    'toolbarIcon',
    'toolbarTitle'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 480px;
          display: table;
          position: absolute;
          background-color: #2c4389;
          font-family: Roboto;
          margin-top: -56px;
        }
        ^ .wrapper {
          display: table-cell;
          vertical-align: middle;
        }
        ^ .about-mintchip {
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }
      */}
    })
  ],

  properties: [
    ['header', true]
  ],

  messages: [
    { name: 'name', message: 'MintChip Merchant' },
    { name: 'version', message: '0.0.1' },
    { name: 'copyright', message: '© nanopay Corporation.'},
    { name: 'rights', message: 'All rights reserved.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarTitle = 'About MintChip';
      this.toolbarIcon = 'menu';

      this
        .addClass(this.myClass())
        .start('div').addClass('wrapper')
          .start('div').addClass('about-mintchip')
            .start('div').addClass('mintchip-logo')
              .attrs({ 'aria-hidden': true })
              .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-launcher/64x64.png' })
            .end()
            .start('h3').add(this.name).end()
            .start().add('Version ' + this.version).end().br()
            .start().add(this.copyright).br().add(this.rights).end()
          .end()
        .end()

    }
  ]
});
