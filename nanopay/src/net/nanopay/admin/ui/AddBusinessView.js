foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'AddBusinessView',
  extends: 'foam.u2.Controller',

  documentation: 'View for adding a business',

  css: `
    ^ .container {
      width: 540px;
      margin: 0 auto;
    }
    ^ .header {
      font-size: 30px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
    }
    ^ .description {
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
    }
    ^ .label {
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-left: 0;
    }
    ^ .largeInput {
      width: 540px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
  `,

  properties: [
    {
      name: 'legalName',
      class: 'String'
    },
    {
      name: 'jobTitle',
      class: 'String'
    },
    {
      name: 'emailAddress',
      class: 'String'
    },
    {
      name: 'confirmEmailAddress',
      class: 'String'
    },
    {
      name: 'businessPhoneNumber',
      class: 'String'
    }
  ],

  messages: [
    { name: 'Title', message: 'Add Business' },
    { name: 'Description', message: 'Fill in the details for the admin user of this business, the user will receive an email with login credentials after.' },
    { name: 'LegalNameLabel', message: 'Legal Name' },
    { name: 'JobTitleLabel', message: 'Job Title' },
    { name: 'EmailLabel', message: 'Email Address' },
    { name: 'ConfirmEmailLabel', message: 'Confirm Email Address' },
    { name: 'BusinessPhoneLabel', message: 'Business Phone Number' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start('p').add(this.Title).addClass('header').end()
            .start('p').add(this.Description).addClass('description').end()
            .start('p').add(this.LegalNameLabel).addClass('label').end()
            .start(this.LEGAL_NAME).addClass('largeInput').end()
            .start('p').add(this.JobTitleLabel).addClass('label').end()
            .start(this.JOB_TITLE).addClass('largeInput').end()
            .start('p').add(this.EmailLabel).addClass('label').end()
            .start(this.EMAIL_ADDRESS).addClass('largeInput').end()
            .start('p').add(this.ConfirmEmailLabel).addClass('label').end()
            .start(this.CONFIRM_EMAIL_ADDRESS).addClass('largeInput').end()
            .start('p').add(this.BusinessPhoneLabel).addClass('label').end()
            .start(this.BUSINESS_PHONE_NUMBER).addClass('largeInput').end()
          .end()
        .end();
    }
  ]
});