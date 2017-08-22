
foam.CLASS({
  package: 'net.nanopay.b2b.ui.settings',
  name: 'BankAccountSettingsView',
  extends: 'foam.u2.DetailView',

  documentation: 'View for editing user business bank account information.',

  imports: [
    'business'
  ],

  properties: [
      { name: 'data', factory: function() { return this.business; } },
      [ 'of', 'net.nanopay.b2b.model.Business' ]
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.add(this.SAVE);
    }
  ],

  actions: [
    function save(X) {
      X.business.bankAccount.copyFrom(this);
      X.businessDAO.put(X.business);
    }
  ]
});
