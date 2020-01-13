foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'CreateBusinessModal',
  extends: 'foam.u2.Controller',

  documentation: 'Create new business modal',

  imports: [
    'notify'
  ],

  css: `
    ^ {
      width: 500px;
      background: white;
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
      margin-bottom: 60px;
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
      name: 'Description',
      message: `
        Fill out information about your business. You'll be able to access
        this business on the switch business menu.`
    },
    { name: 'TITLE', message: 'Create business ' }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('h2').add(this.TITLE).addClass('medium-header').end()
        .start().addClass('content')
          .start('p').addClass('description').add(this.Description).end()
          .start(this.COMPANY_NAME).end()
          .start()
            .start(this.CANCEL).end()
            .start(this.CREATE).end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function(X) {
        console.log('hit cancel');
      }
    },
    {
      name: 'create',
      code: function(X) {
        // Call business create service.
        // Service will be responsible for creating a business and
        // associating a junction between the newly created business and user.
        console.log('business created');
      }
    }
  ]
});
