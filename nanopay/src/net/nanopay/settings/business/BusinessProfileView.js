foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'BusinessProfileView',
  extends: 'foam.u2.View',

  imports: [ 'stack', 'user' ],

  exports: [ 'as data' ],

  documentation: 'View displaying business information',

  css: `
    ^{
      width: 100%;
      background-color: #edf0f5;
      margin: auto;
    }
    ^ .businessSettingsContainer {
      width: 992px;
      margin: auto;
    }
    ^ .Container {
      width: 992px;
      min-height: 80px;
      margin-top: 30px;
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 2px;
      background-color: white;
      box-sizing: border-box;
    }
    ^ .boxTitle {
      opacity: 0.6;
      font-family: 'Roboto';
      font-size: 20px;
      font-weight: 300;
      line-height: 20px;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      display: inline-block;
    }
    ^ .profileImg {
      width: 80px;
      height: 80px;
    }
    ^ .profileImgDiv {
      margin-bottom: 20px;
      margin-top: 20px;
      line-height: 80px;
      position: relative;
    }
    ^ .companyName {
      font-family: 'Roboto';
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      margin-left: 40px;
      display: inline-block;
      line-height: 16px;
      position: absolute;
      top: 40%;
    }
    ^ .labelDiv {
      margin-bottom: 30px;
    }
    ^ .inlineDiv {
      display: inline-block;
      margin-right: 80px;
    }
    ^ .topInlineDiv {
      display: inline-block;
      vertical-align: top;
    }
    ^ .labelTitle {
      font-family: Roboto;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-bottom: 15px;
    }
    ^ .labelContent {
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      display: flex;
      width: 185px;
    }
    ^ .foam-u2-ActionView-editProfile {
      text-decoration: underline;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.2px;
      color: #59a5d5;
      display: inline-block;
      margin-left: 40px;
      cursor: pointer;
      opacity: 1;
    }
    ^ .net-nanopay-ui-ActionView-editProfile {
      color: #59a5d5;
      background-color: white;
      text-decoration: underline;
      margin-left: 42px;
    }
    ^ .net-nanopay-ui-ActionView-editProfile:hover {
      cursor: pointer;
    }
    ^ .net-nanopay-ui-ActionView-editProfile:active {
      color: #2974a3;
    }
    ^ .dayOfWeekDiv {
      margin-top: 20px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton {
      width: 136px;
      height: 40px;
      border-radius: 2px;
      background: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      color: white;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
      margin: 0;
      outline: none;
      font-weight: normal;
      margin-top: 30px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton:hover {
      background: %SECONDARYCOLOR%;
      border-color: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .toggleDiv {
      position: relative;
      display: inline-block;
      float: right;
      top: 4;
    }
    ^ .show {
      visibility: visible;
    }
    ^ .hide {
      visibility: hidden;
    }
    ^ .foam-u2-tag-Select {
      width: 70px;
      height: 30px;
      border-radius: 0;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      padding: 0 15px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      background-color: white;
      outline: none;
    }
    ^ .property-hours {
      margin-left: 20px;
      margin-right: 5px;
      display: inline-block;
    }
    ^ .property-periods {
      margin-right: 20px;
      display: inline-block;
    }
    ^ .caret {
      position: relative;
    }
    .caret:before {
      content: '';
      position: absolute;
      top: 12px;
      left: 49px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }
    .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }
  `,

  properties: [
    'businessSectorName',
    'businessTypeName',
    {
      class: 'Boolean',
      name: 'businessHoursEnabled',
      value: false
    },
    {
      name: 'hours',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          '1:00','1:30',
          '2:00','2:30',
          '3:00','3:30',
          '4:00','4:30',
          '5:00','5:30',
          '6:00','6:30',
          '7:00','7:30',
          '8:00','8:30',
          '9:00','9:30',
          '10:00','10:30',
          '11:00','11:30',
          '12:00','12:30'
        ]
      }
    },
    {
      name: 'periods',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'AM',
          'PM'
        ]
      }
    }
  ],

  messages: [
    {
      name: 'MondayLabel', message: 'Mon.'
    },
    {
      name: 'TuesdayLabel', message: 'Tue.'
    },
    {
      name: 'WednesdayLabel', message: 'Wed.'
    },
    {
      name: 'ThursdayLabel', message: 'Thu.'
    },
    {
      name: 'FridayLabel', message: 'Fri.'
    },
    {
      name: 'ToLabel', message: 'To'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.user.businessSectorId$find.then(function(sector) {
        self.businessSectorName = sector.name;
      });
      this.user.businessTypeId$find.then(function(type) {
        self.businessTypeName = type.name;
      });


      this
      .addClass(this.myClass())

      .start().addClass('businessSettingsContainer')
        .start().addClass('Container')
          .start().add('Business Profile').addClass('boxTitle').end()
          .add(this.EDIT_PROFILE)
          .start().addClass('profileImgDiv')
            .start({ class: 'foam.u2.tag.Image', data: 'images/business-placeholder.png'}).addClass('profileImg').end()
            .start().add(this.user.businessName).addClass('companyName').end()
          .end()
          .start()
            .start().addClass('inlineDiv')
              .start().addClass('labelDiv')
                .start().add('Company Type').addClass('labelTitle').end()
                .start().add(this.businessTypeName$).addClass('labelContent').end()
              .end()
              .start().addClass('labelDiv')
                .start().add('Business Sector').addClass('labelTitle').end()
                .start().add(this.businessSectorName$).addClass('labelContent').end()
              .end()
            .end()
            .start().addClass('inlineDiv')
              .start().addClass('labelDiv')
                .start().add('Business Identification No.').addClass('labelTitle').end()
                .start().add(this.user.businessIdentificationNumber).addClass('labelContent').end()
              .end()
              .start().addClass('labelDiv')
                .start().add('Issuing Authority').addClass('labelTitle').end()
                .start().add(this.user.issuingAuthority).addClass('labelContent').end()
              .end()
            .end()
            .start().addClass('topInlineDiv')
              .start().addClass('labelDiv')
                .start().add('Website').addClass('labelTitle').end()
                .start().add(this.user.website).addClass('labelContent').end()
              .end()
            .end()
            .start().addClass('topInlineDiv')
              .start().addClass('labelDiv')
                .start().add('Address').addClass('labelTitle').end()
                .startContext()
                  .start().hide(this.user.address.structured$)
                    .start().add(this.user.address.address1).addClass('labelContent').end()
                    .start().add(this.user.address.address2).addClass('labelContent').end()
                  .end()
                  .start().show(this.user.address.structured$)
                    .start().add(this.user.address.streetNumber +" "+this.user.address.streetName).addClass('labelContent').end()
                    .start().add(this.user.address.suite).addClass('labelContent').end()
                  .end()
                .endContext()
                .start().add(this.user.address.city + ", "+this.user.address.regionId).addClass('labelContent').end()
                .start().add(this.user.address.countryId).addClass('labelContent').end()
                .start().add(this.user.address.postalCode).addClass('labelContent').end()
              .end()
            .end()
          .end()
        .end()
        .start().addClass('Container')
          .start().add('Business Hours').addClass('boxTitle').end()
          .start('div').addClass('toggleDiv')
            .tag({ class: 'net.nanopay.ui.ToggleSwitch', data$: this.businessHoursEnabled$ })
          .end()
          .start().addClass(this.businessHoursEnabled$.map(function(e) { return e ? 'show' : 'hide' }))
            .start().addClass('dayOfWeekDiv')
              .start().add(this.MondayLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
              .start().add(this.ToLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
            .end()
            .start().addClass('dayOfWeekDiv')
              .start().add(this.TuesdayLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
              .start().add(this.ToLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
            .end()
            .start().addClass('dayOfWeekDiv')
              .start().add(this.WednesdayLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
              .start().add(this.ToLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
            .end()
            .start().addClass('dayOfWeekDiv')
              .start().add(this.ThursdayLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
              .start().add(this.ToLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
            .end()
            .start().addClass('dayOfWeekDiv')
              .start().add(this.FridayLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
              .start().add(this.ToLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
            .end()
            .start().addClass('dayOfWeekDiv')
              .start().add('Sat.').addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
              .start().add(this.ToLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
            .end()
            .start().addClass('dayOfWeekDiv')
              .start().add('Sun.').addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
              .start().add(this.ToLabel).addClass('labelTitle inline').end()
              .start(this.HOURS)
                .start('div').addClass('caret').end()
              .end()
              .start(this.PERIODS)
                .start('div').addClass('caret').end()
              .end()
            .end()
            .start().add(this.SAVE_BUTTON).end()
          .end()
        .end()
      .end()
    }
  ],

  actions: [
    {
      name: 'editProfile',
      label: 'Edit Profile',
      code: function (X) {
        X.stack.push({ class: 'net.nanopay.settings.business.EditBusinessView', showCancel: true });
      }
    },
    {
      name: 'saveButton',
      label: 'Save',
      code: function (X) {
        // Save business hours
      }
    }
  ]
});
