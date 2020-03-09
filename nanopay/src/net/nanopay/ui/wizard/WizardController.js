foam.CLASS({
  package: 'net.nanopay.ui.wizard',
  name: 'WizardController',
  extends: 'foam.u2.View',

  imports: [
    'ctrl',
    'stack'
  ],

  requires: [
    'foam.u2.detail.WizardSectionView',
    'net.nanopay.sme.ui.SMEModal'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'model_',
      expression: function(model) {
        return (foam.lookup(model)).create();
      }
    },
    {
      class: 'String',
      name: 'model'
    }
  ],
  
  methods: [
    function initE() {
      this.start().addClass(this.myClass())
        .add(this.SMEModal.create().tag({
          class: 'net.nanopay.ui.wizard.WizardSectionController',
          data: this.model_
        }))
      .end()
    }
  ]

});