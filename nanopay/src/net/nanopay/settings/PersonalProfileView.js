foam.CLASS({
  package: 'net.nanopay.settings',
  name: 'PersonalProfileView',
  extends: 'foam.u2.View',

  documentation: 'Settings / Personal View',

  imports: [
    'auth',
    'user',
    'stack',
    'userDAO'
  ],

  exports: [ 'as data' ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  css:`
    ^{
      width: 1280px;
      margin: auto;
    }
    ^ .Container{
      width: 960px;
      padding-bottom: 13px;
      border-radius: 2px;
      background-color: #ffffff;
      margin-top: 50px;
      margin-left: 160px;
    }
    ^ .firstName-Text{
      margin-left: 20px;
      margin-right: 88px;
      margin-bottom: 8px;
    }
    ^ .lastName-Text{
      margin-right: 82px;
      margin-bottom: 8px;
    }
    ^ .jobTitle-Text{
      margin-bottom: 8px;
    }
    ^ h1{
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      display: inline-block;
    }
    ^ h2{
      width: 150px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      display: inline-block;
    }
    ^ input{
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 10px;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2;
      text-align: left;
      color: #093649;
    }
    ^ .firstName-Input{
      width: 215px;
      height: 40px;
      margin-left: 20px;
      margin-right: 20px;
      margin-bottom: 20px;
    }
    ^ .lastName-Input{
      width: 215px;
      height: 40px;
      margin-right: 20px;
    }
    ^ .jobTitle-Input{
      width: 450px;
      height: 40px;
    }
    ^ .emailAddress-Text{
      margin-left: 20px;
      margin-bottom: 8px;
      margin-right: 322px;
    }
    ^ .phoneNumber-Dropdown{
      width: 80px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-right: 10px;
    }
    ^ .emailAddress-Input{
      width: 450px;
      height: 40px;
      margin-left: 20px;
      margin-right: 20px;
      margin-bottom: 19px;
    }
    ^ .phoneNumber-Input{
      width: 360px;
      height: 40px;
    }
    ^ .update-BTN{
      width: 135px;
      height: 40px;
      border-radius: 2px;
      font-family: Roboto;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
      cursor: pointer;
      border: 1px solid %SECONDARYCOLOR%;
      background-color: %SECONDARYCOLOR%;
      margin-left: 20px;
      margin-top: 19px;
    }
    ^ .update-BTN:hover {
      opacity: 0.9;
      border: 1px solid %SECONDARYCOLOR%;
    }
    ^ .check-Box{
      border: solid 1px rgba(164, 179, 184, 0.5);
      width: 14px;
      height: 14px;
      border-radius: 2px;
      margin-right: 20px;
      position: relative;
    }
    ^ .foam-u2-CheckBox{
      margin-left: 20px;
      padding-bottom: 11px;
      display: inline-block;
    }
    ^ .checkBox-Text{
      height: 16px;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      display: block;
      margin-bottom: 11px;
    }
    ^ .status-Text{
      width: 90px;
      height: 14px;
      font-family: Roboto;
      font-size: 12px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #a4b3b8;
      margin-left: 20px;
      margin-right: 770px;
      display: inline-block;
    }
    ^ .personalProfile-Text{
      width: 141px;
      height: 20px;
      margin-left: 20px;
      margin-right: 644px;
    }
    ^ .toggleDiv {
      position: relative;
      display: inline-block;
      top: -5;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'firstName',
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'jobTitle'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name: 'phone'
    },
    {
      class: 'String',
      name: 'phoneCode',
      value: '+1'
    },
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      if (this.user.firstName != "")
      {
        this.firstName = this.user.firstName;
        this.lastName = this.user.lastName;
        this.jobTitle = this.user.department;
        this.email = this.user.email;
        this.phone = this.user.phone.number;
      }
      this
      .addClass(this.myClass())
      .start()
        .start().addClass('Container')
          .start('h1').add("Personal profile").addClass('personalProfile-Text').end()
          .start('div')
            .start('h2').add("First name").addClass('firstName-Text').end()
            .start('h2').add("Last name").addClass('lastName-Text').end()
            .start('h2').add("Job Title").addClass('jobTitle-Text').end()
          .end()
          .start('div')
            .start(this.FIRST_NAME).addClass('firstName-Input').end()
            .start(this.LAST_NAME).addClass('lastName-Input').end()
            .start(this.JOB_TITLE).addClass('jobTitle-Input').end()
          .end()
          .start('div')
            .start('h2').add("Email Address").addClass('emailAddress-Text').end()
            .start('h2').add("Phone Number").end()
          .end()
          .start('div')
            .start(this.EMAIL ,{ mode:  this.email ? foam.u2.DisplayMode.RO : foam.u2.DisplayMode.RW}).addClass('emailAddress-Input').end()
            .start(this.PHONE_CODE).addClass('phoneNumber-Dropdown').end()
            .start(this.PHONE).addClass('phoneNumber-Input').end()
          .end()
          .start('div')
            .tag({class: 'foam.u2.CheckBox'}).add("Make my profile visible to public").addClass('checkBox-Text').end()
            .start(this.UPDATE_PROFILE).addClass('update-BTN').end()
          .end()
        .end()
      .end()
    }
  ],

  messages: [
    { name: 'noInformation', message: 'Please fill out all fields.' },
    { name: 'invalidPhone', message: 'Phone number is invalid.' },
    { name: 'informationUpdated', message: 'Information has been successfully changed.' }
  ],

  actions: [
    {
      name: 'updateProfile',
      label: 'Update',
      code: function (X) {
        var self = this;

        if ( ! this.firstName || ! this.lastName || ! this.jobTitle || ! this.email || ! this.phone ) {
          this.add(this.NotificationMessage.create({ message: this.noInformation, type: 'error' }));
          return;
        }

        if ( ! /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(this.phone) ) {
          this.add(self.NotificationMessage.create({ message: this.invalidPhone, type: 'error' }));
          return;
        }

        this.user.firstName = this.firstName;
        this.user.lastName = this.lastName;
        this.user.department = this.jobTitle;
        this.user.email = this.email;
        this.user.phone.number = this.phone;
        this.userDAO.put(this.user).then(function (result) {
          // copy new user, clear password fields, show success
          self.user.copyFrom(result);
          self.add(self.NotificationMessage.create({ message: self.informationUpdated }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
