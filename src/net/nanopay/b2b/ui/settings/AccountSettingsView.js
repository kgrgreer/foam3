
foam.CLASS({
  package: 'net.nanopay.b2b.ui.settings',
  name: 'AccountSettingsView',
  extends: 'foam.u2.DetailView',

  documentation: 'View for editing user account information.',

  imports: [
    'user'
  ],

  properties: [
      { name: 'data', factory: function() { return this.user; } },
      [ 'of', 'foam.nanos.auth.User' ]
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.add(this.SAVE);
    }
  ],

  actions: [
    function save(X) {
      X.user.copyFrom(this);
      X.userDAO.put(X.user);
    }
  ]
});
