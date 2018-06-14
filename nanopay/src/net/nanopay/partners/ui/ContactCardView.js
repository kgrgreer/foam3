foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'ContactCardView',
  extends: 'foam.u2.View',

  documentation: 'View for displaying Contact Card',

  css: `
    ^ {
        margin: auto;
        border-radius: 2px;
        width: 1100px;
        height: 160px;
        padding-left: 25px;
    }
  `,

  methods: [
    function initE() {
      this
        .select(this.data, function(partner) {
          this.addClass(this.myClass())
            .tag({
              class: 'net.nanopay.partners.ui.ContactCard'
            }, {
              data: partner
            });
        });
    }
  ]
});
