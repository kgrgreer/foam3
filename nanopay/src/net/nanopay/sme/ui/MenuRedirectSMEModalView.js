foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'MenuRedirectSMEModalView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.sme.ui.MenuRedirectSMEModal'
  ],

  properties: [
    {
      class: 'String',
      name: 'menu',
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      type: 'foam.lib.json.UnknownFObject',
      fromJSON: function fromJSON(value, ctx, prop, json) { return value; }
    }
  ],

  methods: [
    function initE() {
      this.start()
        .addClass(this.myClass())
        .add(this.MenuRedirectSMEModal.create({ menu: this.menu }, this).tag(this.view))
      .end();
    }
  ]
});