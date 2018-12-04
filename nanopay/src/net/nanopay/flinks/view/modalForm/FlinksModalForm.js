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
    'institution',
    'cadCurrency'
  ],

  imports: [
    'currencyDAO'
  ],

  css: `
    ^ .field-label {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
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
    },
    'cadCurrency'
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;
      this.views = {
        'connect'                 : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalConnect' }, startPoint: true },
        'security'                : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalSecurity' } },
        'securityQuestionAnswer'  : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer' } },
        'securityReset'           : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalSecurityReset' } },
        'securityMultipleChoice'  : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalSecurity' } }, // TODO
        'securityImage'           : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalSecurityImage' } },
        'accountSelection'        : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalAccountSelect' } },
        'pad'                     : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalPAD' } },
      };

      this.currencyDAO.find('CAD').then(function(currency) {
        self.cadCurrency = currency;
      });
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
