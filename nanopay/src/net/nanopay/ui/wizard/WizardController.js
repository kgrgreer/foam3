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
        return (foam.lookup(model)).create({}, this);
      }
    },
    {
      class: 'String',
      name: 'model'
    },
    {
      class: 'String',
      name: 'modelName',
      expression: function(model) {
        var array = model.split(".");
        return array[array.length - 1];
      }
    }
  ],
  
  methods: [
    function initE() {
      this.start().addClass(this.myClass())
        .add(this.SMEModal.create().tag({
          class: `net.nanopay.contacts.ui.${this.modelName}WizardView`,
          data: this.model_
        }))
      .end()
    }
  ]

});