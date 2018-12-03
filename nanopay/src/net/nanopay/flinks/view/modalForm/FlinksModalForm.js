foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  exports: [
    'isConnecting',
    'notify',
    'institution'
  ],

  css: `
    ^ {
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^ .spinner-container {
      background-color: #ffffff;
      width: 100%;
      height: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 1;
    }
    ^ .spinner-container-center {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      height: 100%;
    }
    ^ .spinner-container .net-nanopay-ui-LoadingSpinner img {
      width: 50px;
      height: 50px;
    }
    ^ .spinner-text {
      font-weight: normal;
      font-size: 12px;
      color: rgba(9, 54, 73, 0.7);
    }
  `,

  properties: [
    {
      name: 'institution',
      factory: function() {
        return { name: 'Placeholder Bank', description: '', image: 'images/banks/flinks.svg' }
      }
    },
    {
      class: 'Boolean',
      name: 'isConnecting',
      value: false
    }
  ],

  methods: [
    function init() {
      this.views = {
        'connect' : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalConnect' }, startPoint: true },
        // 'security' : { view: { class: 'net.nanopay.ui.wizardModal.example.ExampleWizardModalSubView2' } }
      }
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },

    function notify(message, type) {
      this.add(this.NotificationMessage.create({
        message,
        type
      }));
    }
  ]
});
