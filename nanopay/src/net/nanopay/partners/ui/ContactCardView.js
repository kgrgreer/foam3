foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'ContactCardView',
  extends: 'foam.u2.Element',

  documentation: 'View for displaying Contact Card',

  requires: [
    'net.nanopay.partners.ui.ContactCard'
  ],

  css: `
    ^ {
        margin: auto;
        border-radius: 2px;
        width: 1100px;
        height: 160px;
        padding-left: 25px;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .select(this.data$proxy, function(partner) {
          return this.ContactCard.create({ data: partner });
        });
    }
  ]
});
