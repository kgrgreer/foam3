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
          background-color: #2c4389;
          position: fixed;
        }
      */}
    })
  ],

  properties: [
    ['header', true]
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarTitle = 'About MintChip';
      this.toolbarIcon = 'menu';

      this
        .addClass(this.myClass())

    }
  ]
});
