foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'CreateBusinessModal',
  extends: 'foam.u2.Controller',

  documentation: 'Create new business modal',

  requires: [
    'net.nanopay.model.Business'
  ],

  imports: [
    'notify',
    'businessDAO'
  ],

  css: `
    ^ {
      width: 500px;
      background: white;
      padding: 20px;
    }
    .net-nanopay-sme-ui-AbliiActionView-closeModal {
      width: 60px;
      background: none !important;
      border: none !important;
      color: #525455;
      font-size: 16px;
      margin-right: 25px;
    }
    ^ .description {
      font-size: 12px;
      text-align: center;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-create {
      float: right;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      margin-bottom: 20px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'companyName'
    }
  ],

  messages: [
    {
      name: 'DESCRIPTION',
      message: `
        Fill out information about your business. You'll be able to access
        this business on the switch business menu.`
    },
    { name: 'TITLE', message: 'Create a Business' },
    { name: 'SUCCESS_MESSAGE', message: 'Business successfully created!' },
    { name: 'ERROR_MESSAGE', message: 'Sorry, there was an error creating this business.' }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('h2').add(this.TITLE).addClass('medium-header').end()
        .start().addClass('content')
          .start('p').addClass('description').add(this.DESCRIPTION).end()
          .start().addClass('input-label').add(this.COMPANY_NAME.label).end()
          .start(this.COMPANY_NAME).end()
          .startContext({ data: this })
            .start()
              .start(this.CANCEL).end()
              .start(this.CREATE).end()
            .end()
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'create',
      code: async function(X) {
        var business = this.Business.create({
          organization: this.companyName,
          businessName: this.companyName
        });
        try {
          await this.businessDAO.put(business);
          // this.businessDAO.pub();
          this.notify(this.SUCCESS_MESSAGE);
        } catch (e) {
          this.notify(`${this.ERROR_MESSAGE} ${e}`, 'error');
        }
        X.closeDialog();
      }
    }
  ]
});
