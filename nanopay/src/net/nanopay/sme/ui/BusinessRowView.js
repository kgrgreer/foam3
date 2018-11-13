foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessRowView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A single row in a list of businesses.
  `,

  imports: [
    'businessDAO',
    'user'
  ],

  requires: [
    'net.nanopay.model.Business',
  ],

  css: `
    ^ {
      background: white;
      margin-bottom: 4px;
      border-radius: 4px;
      padding: 8px 16px;
    }
    ^row {
      display: flex;
      justify-content: space-between;
      padding: 4px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.UserUserJunction',
      name: 'data',
      documentation: 'Set this to the business you want to display in this row.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Business',
      name: 'business'
    }
  ],

  methods: [
    function initE() {
        this.businessDAO
          .find(this.data.targetId).then((business) => {
            this.business = business;
          });

      this.start()
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('row'))
          .start('span')
            .add(this.slot(function(business) {
              return business ? business.businessName : '';
            }))
          .end()
          .start().add('➜').end()
        .end()
      .end();
    }
  ]
});
