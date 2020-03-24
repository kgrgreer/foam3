foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEModalWrapper',
  extends: 'foam.u2.View',
  
  documentation: `Wraps given view in a SMEModalWrapper.`,

  requires: [
    'net.nanopay.sme.ui.MenuRedirectSMEModal'
  ],

  properties: [
    {
      class: 'String',
      name: 'view'
    }
  ],

  methods: [
    function initE() {
      this.start().addClass(this.myClass())
        .add(this.MenuRedirectSMEModal.create({ menu: 'sme.main.contacts' }).tag({ class: this.view }))
      .end()
    }
  ]
});