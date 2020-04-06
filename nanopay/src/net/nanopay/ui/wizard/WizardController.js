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
    'net.nanopay.sme.ui.MenuRedirectSMEModal'
  ],

  css: `
    .wizard {
      display: flex;
      flex-direction: column;
      width: 540px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    .section-container {
      padding: 24px 24px 32px;
    }
    .foam-u2-tag-Input, .foam-u2-view-StringView {
      width: 100%;
    }
    .foam-u2-CheckBox-label span {
      color: /*%BLACK%*/ #1e1f21;
      font-size: 14px;
      line-height: 1.5;
    }
    .button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    .net-nanopay-sme-ui-AbliiActionView-tertiary:focus:not(:hover),
    .net-nanopay-sme-ui-AbliiActionView-primary:focus:not(:hover) {
      border-color: transparent;
    }
  `,

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
        .add(this.MenuRedirectSMEModal.create({ menu: 'sme.main.contacts' }).tag({
          class: `net.nanopay.contacts.ui.${this.modelName}WizardView`,
          data: this.model_
        }))
      .end()
    }
  ]

});