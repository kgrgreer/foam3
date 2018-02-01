foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'BusinessHoursView',
  extends: 'foam.u2.View',

  documentation: 'View displaying business hours',

  imports: [ 
    'user',
    'userDAO'
  ],

  exports: [ 'as data' ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.DayOfWeek',
    'foam.nanos.auth.Hours',
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
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
    ^ .labelTitle {
      font-family: Roboto;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-bottom: 15px;
    }
    ^ .businessHourLabels {
      width: 30px;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-bottom: 15px;
      display: inline-block;
      visibility: visible !important;
    }
    ^ .dayOfWeekDiv {
      display: inline-block;
      margin-top: 20px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton {
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
      margin-top: 30px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton:hover {
      opacity: 0.9;
      border: 1px solid %SECONDARYCOLOR%;
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
    ^ .foam-u2-TimeView {
      height: 30px;
      outline: none;
      margin-left: 20px;
      margin-right: 20px;
    }
    ^ .closed-text {
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      color: #093649;
    }
    ^ .box-width {
      width: 600px;
    }
    ^ .alignClosedBoxLeft {
      position: relative;
      right: 268;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'businessHoursEnabled',
      value: false
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedMonday',
      value: false
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedTuesday',
      value: false
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedWednesday',
      value: false
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedThursday',
      value: false
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedFriday',
      value: false
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedSaturday',
      value: false
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedSunday',
      value: false
    },
    {
      class: 'Time',
      name: 'mondayStartTime',
      factory: function() {
        return this.user.address.hours[0].startTime ? this.user.address.hours[0].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'mondayEndTime',
      factory: function() {
        return this.user.address.hours[0].endTime ? this.user.address.hours[0].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'tuesdayStartTime',
      factory: function() {
        return this.user.address.hours[1].startTime ? this.user.address.hours[1].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'tuesdayEndTime',
      factory: function() {
        return this.user.address.hours[1].endTime ? this.user.address.hours[1].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'wednesdayStartTime',
      factory: function() {
        return this.user.address.hours[2].startTime ? this.user.address.hours[2].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'wednesdayEndTime',
      factory: function() {
        return this.user.address.hours[2].endTime ? this.user.address.hours[2].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'thursdayStartTime',
      factory: function() {
        return this.user.address.hours[3].startTime ? this.user.address.hours[3].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'thursdayEndTime',
      factory: function() {
        return this.user.address.hours[3].endTime ? this.user.address.hours[3].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'fridayStartTime',
      factory: function() {
        return this.user.address.hours[4].startTime ? this.user.address.hours[4].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'fridayEndTime',
      factory: function() {
        return this.user.address.hours[4].endTime ? this.user.address.hours[4].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'saturdayStartTime',
      factory: function() {
        return this.user.address.hours[5].startTime ? this.user.address.hours[5].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'saturdayEndTime',
      factory: function() {
        return this.user.address.hours[5].endTime ? this.user.address.hours[5].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'sundayStartTime',
      factory: function() {
        return this.user.address.hours[6].startTime ? this.user.address.hours[6].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'sundayEndTime',
      factory: function() {
        return this.user.address.hours[6].endTime ? this.user.address.hours[6].endTime : '';
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
      name: 'SaturdayLabel', message: 'Sat.'
    },
    {
      name: 'SundayLabel', message: 'Sun.'
    },
    {
      name: 'ToLabel', message: 'To'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
      .addClass(this.myClass())
      .start().addClass('Container')
        .start().add('Business Hours').addClass('boxTitle').end()
        .start('div').addClass('toggleDiv')
          .tag({ class: 'net.nanopay.ui.ToggleSwitch', data$: this.businessHoursEnabled$ })
        .end()
        .start().addClass(this.businessHoursEnabled$.map(function(e) { return e ? 'show' : 'hide' })).addClass('box-width')
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedMonday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.MondayLabel).addClass('businessHourLabels').end()
            .start(this.MONDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle inline').end()
            .start(this.MONDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedMonday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedMonday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedTuesday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.TuesdayLabel).addClass('businessHourLabels').end()
            .start(this.TUESDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle inline').end()
            .start(this.TUESDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedTuesday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedTuesday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedWednesday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.WednesdayLabel).addClass('businessHourLabels').end()
            .start(this.WEDNESDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle inline').end()
            .start(this.WEDNESDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedWednesday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedWednesday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedThursday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.ThursdayLabel).addClass('businessHourLabels').end()
            .start(this.THURSDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle inline').end()
            .start(this.THURSDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedThursday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedThursday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedFriday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.FridayLabel).addClass('businessHourLabels').end()
            .start(this.FRIDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle inline').end()
            .start(this.FRIDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedFriday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedFriday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedSaturday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.SaturdayLabel).addClass('businessHourLabels').end()
            .start(this.SATURDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle inline').end()
            .start(this.SATURDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedSaturday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedSaturday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedSunday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.SundayLabel).addClass('businessHourLabels').end()
            .start(this.SUNDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle inline').end()
            .start(this.SUNDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedSunday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedSunday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().add(this.SAVE_BUTTON).end()
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'saveButton',
      label: 'Save',
      code: function (X) {
        // Save business hours

        var self = this;

        var businessHoursArray = [];

        var mondayHours = this.Hours.create({
          day: this.DayOfWeek.MONDAY,
          startTime: this.mondayStartTime,
          endTime: this.mondayEndTime
        });
        var tuesdayHours = this.Hours.create({
          day: this.DayOfWeek.TUESDAY,
          startTime: this.tuesdayStartTime,
          endTime: this.tuesdayEndTime
        });
        var wednesdayHours = this.Hours.create({
          day: this.DayOfWeek.WEDNESDAY,
          startTime: this.wednesdayStartTime,
          endTime: this.wednesdayEndTime
        });
        var thursdayHours = this.Hours.create({
          day: this.DayOfWeek.THURSDAY,
          startTime: this.thursdayStartTime,
          endTime: this.thursdayEndTime
        });
        var fridayHours = this.Hours.create({
          day: this.DayOfWeek.FRIDAY,
          startTime: this.fridayStartTime,
          endTime: this.fridayEndTime
        });
        var saturdayHours = this.Hours.create({
          day: this.DayOfWeek.SATURDAY,
          startTime: this.saturdayStartTime,
          endTime: this.saturdayEndTime
        });
        var sundayHours = this.Hours.create({
          day: this.DayOfWeek.SUNDAY,
          startTime: this.sundayStartTime,
          endTime: this.sundayEndTime
        });

        businessHoursArray.push(
          mondayHours, 
          tuesdayHours, 
          wednesdayHours,
          thursdayHours,
          fridayHours,
          saturdayHours,
          sundayHours
        );
        
        this.user.address.hours = businessHoursArray;
 
        this.userDAO.put(this.user).then(function (response) {
          self.user.copyFrom(response);
          self.add(self.NotificationMessage.create({ message: 'Business hours sucessfully saved.', type: '' }));
        }).catch(function (error) {
          self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
        });
      }

    }
  ]

}); 