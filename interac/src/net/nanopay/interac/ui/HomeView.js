foam.CLASS({
  package: 'net.nanopay.interac.ui',
  name: 'HomeView',
  extends: 'foam.u2.View',

  properties: [
    'transferViews'
  ],

  methods: [
    function init() {
      this.transferViews = [
        { parent: 'etransfer', id: 'etransfer-transfer-details',     label: 'Account & Payee',      view: { class: 'net.nanopay.interac.ui.etransfer.TransferDetails' } },
        { parent: 'etransfer', id: 'etransfer-transfer-amount',      label: 'Amount',               view: { class: 'net.nanopay.interac.ui.etransfer.TransferAmount'  } }
      ];
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .tag({class: 'net.nanopay.interac.ui.shared.wizardView.WizardView', title: 'Send e-Transfer', views: this.transferViews });
    }
  ]
});
