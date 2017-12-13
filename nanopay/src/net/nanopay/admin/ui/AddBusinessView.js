foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'AddBusinessView',
  extends: 'foam.u2.View',

  documentation: 'View for adding a business through the wizard view flow',

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .tag({ class: 'net.nanopay.admin.ui.form.business.AddBusinessForm', title: 'Add Business' })
        .end();
    }
  ]
}); 