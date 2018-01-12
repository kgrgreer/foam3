foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'AddCompanyView',
  extends: 'foam.u2.View',

  documentation: 'View for adding a Company through the wizard view flow',

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .tag({ class: 'net.nanopay.admin.ui.form.company.AddCompanyForm', title: 'Add Company' })
        .end();
    }
  ]
}); 