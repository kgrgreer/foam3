foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEModalWrapper',
  extends: 'foam.u2.View',
  
  documentation: `Wraps given view in a SMEModal.`,

  requires: [
    'net.nanopay.sme.ui.SMEModal'
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
        .add(this.SMEModal.create().tag({ class: this.view }))
      .end()
    }
  ]
});