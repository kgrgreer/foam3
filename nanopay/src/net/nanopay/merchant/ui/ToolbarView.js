foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'ToolbarView',
  extends: 'foam.u2.View',

  documentation: 'View with a toolbar',

  imports: [
    'showHeader'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'header'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.onload.sub(function () {
        self.showHeader = self.header;
      })
    }
  ]
});