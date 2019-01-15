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
    'net.nanopay.model.Business'
  ],

  css: `
    ^ {
      background: white;
      border-radius: 4px;
      padding: 20px 24px;
    }
    ^:hover {
      cursor: pointer;
    }
    ^row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px;
    }
    ^:hover ^oval {
      background-color: #604aff;
    }
    ^business-name {
      font-size: 16px;
      font-weight: 800;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #2b2b2b;
      margin-top: 3px;
    }
    ^oval {
      width: 32px;
      height: 32px;
      background-color: #e2e2e3;
      color: #ffffff;
      border-radius: 20px;
      text-align: center;
      font-size: 25px;
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
          .start('span').addClass(this.myClass('business-name'))
            .add(this.slot(function(business) {
              return business ? business.businessName : '';
            }))
          .end()
          .start()
            .addClass(this.myClass('oval'))
            .add('➔')
          .end()
        .end()
      .end();
    }
  ]
});
