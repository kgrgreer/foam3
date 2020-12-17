/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'BusinessHoursView',
  extends: 'foam.u2.View',

  documentation: 'View displaying business hours',

  imports: [
    'notify',
    'user',
    'userDAO'
  ],

  exports: [
    'as data',
    'setDaysClosed',
    'timeRegex'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.DayOfWeek',
    'foam.nanos.auth.Hours',
  ],

  css: `
    ^ .Container {
      width: 1000px;
      min-height: 80px;
      margin: auto;
      margin-top: 30px;
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 2px;
      background-color: white;
      box-sizing: border-box;
    }
    ^ .labelTitle {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 15px;
    }
    ^ .businessHourLabels {
      width: 30px;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 15px;
      display: inline-block;
      visibility: visible !important;
    }
    ^ .dayOfWeekDiv {
      display: inline-block;
      margin-top: 20px;
    }
    ^ .foam-u2-ActionView-saveButton {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
      cursor: pointer;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
      background-color: /*%PRIMARY3%*/ #406dea;
      margin-top: 30px;
    }
    ^ .foam-u2-ActionView-saveButton:hover {
      opacity: 0.9;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
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
    ^ .foam-u2-TimeView {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      color: /*%BLACK%*/ #1e1f21;
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
      color: /*%BLACK%*/ #1e1f21;
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
      factory: function() {
        return this.user.businessHoursEnabled;
      }
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedSunday',
      factory: function() {
        var storeHours = this.user.address.hours[0];
        if ( storeHours != undefined && (storeHours.startTime == '' && storeHours.endTime == '') ) {
          return true;
        }
        return false;
      }
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedMonday',
      factory: function() {
        var storeHours = this.user.address.hours[1];
        if ( storeHours != undefined && (storeHours.startTime == '' && storeHours.endTime == '') ) {
          return true;
        }
        return false;
      }
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedTuesday',
      factory: function() {
        var storeHours = this.user.address.hours[2];
        if ( storeHours != undefined && (storeHours.startTime == '' && storeHours.endTime == '') ) {
          return true;
        }
        return false;
      }
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedWednesday',
      factory: function() {
        var storeHours = this.user.address.hours[3];
        if ( storeHours != undefined && (storeHours.startTime == '' && storeHours.endTime == '') ) {
          return true;
        }
        return false;
      }
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedThursday',
      factory: function() {
        var storeHours = this.user.address.hours[4];
        if ( storeHours != undefined && (storeHours.startTime == '' && storeHours.endTime == '') ) {
          return true;
        }
        return false;
      }
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedFriday',
      factory: function() {
        var storeHours = this.user.address.hours[5];
        if ( storeHours != undefined && (storeHours.startTime == '' && storeHours.endTime == '') ) {
          return true;
        }
        return false;
      }
    },
    {
      class: 'Boolean',
      name: 'checkBoxClosedSaturday',
      factory: function() {
        var storeHours = this.user.address.hours[6];
        if ( storeHours != undefined && (storeHours.startTime == '' && storeHours.endTime == '') ) {
          return true;
        }
        return false;
      }
    },
    {
      class: 'Time',
      name: 'sundayStartTime',
      factory: function() {
        return this.user.address.hours[0] != undefined ? this.user.address.hours[0].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'sundayEndTime',
      factory: function() {
        return this.user.address.hours[0] != undefined ? this.user.address.hours[0].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'mondayStartTime',
      factory: function() {
        return this.user.address.hours[1] != undefined ? this.user.address.hours[1].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'mondayEndTime',
      factory: function() {
        return this.user.address.hours[1] != undefined ? this.user.address.hours[1].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'tuesdayStartTime',
      factory: function() {
        return this.user.address.hours[2] != undefined ? this.user.address.hours[2].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'tuesdayEndTime',
      factory: function() {
        return this.user.address.hours[2] != undefined ? this.user.address.hours[2].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'wednesdayStartTime',
      factory: function() {
        return this.user.address.hours[3] != undefined ? this.user.address.hours[3].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'wednesdayEndTime',
      factory: function() {
        return this.user.address.hours[3] != undefined ? this.user.address.hours[3].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'thursdayStartTime',
      factory: function() {
        return this.user.address.hours[4] != undefined ? this.user.address.hours[4].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'thursdayEndTime',
      factory: function() {
        return this.user.address.hours[4] != undefined ? this.user.address.hours[4].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'fridayStartTime',
      factory: function() {
        return this.user.address.hours[5] != undefined ? this.user.address.hours[5].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'fridayEndTime',
      factory: function() {
        return this.user.address.hours[5] != undefined ? this.user.address.hours[5].endTime : '';
      }
    },
    {
      class: 'Time',
      name: 'saturdayStartTime',
      factory: function() {
        return this.user.address.hours[6] != undefined ? this.user.address.hours[6].startTime : '';
      }
    },
    {
      class: 'Time',
      name: 'saturdayEndTime',
      factory: function() {
        return this.user.address.hours[6] != undefined ? this.user.address.hours[6].endTime : '';
      }
    }
  ],

  messages: [
    {
      name: 'Title', message: 'Business Hours'
    },
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
      var self = this;

      this
      .addClass(this.myClass())
      .start().addClass('Container')
        .start().add(this.Title).addClass('boxTitle').end()
        .start('div').addClass('toggleDiv')
          .tag({ class: 'net.nanopay.ui.ToggleSwitch', data$: this.businessHoursEnabled$ })
          .on('click', function() {
            return !self.businessHoursEnabled ? self.user.businessHoursEnabled = true : self.user.businessHoursEnabled = false;
          })
        .end()
        .start().addClass(this.businessHoursEnabled$.map(function(e) { return e ? 'show' : 'hide' })).addClass('box-width')
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedMonday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.MondayLabel).addClass('businessHourLabels').end()
            .start(this.MONDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle').addClass('inline').end()
            .start(this.MONDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedMonday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedMonday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedTuesday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.TuesdayLabel).addClass('businessHourLabels').end()
            .start(this.TUESDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle').addClass('inline').end()
            .start(this.TUESDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedTuesday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedTuesday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedWednesday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.WednesdayLabel).addClass('businessHourLabels').end()
            .start(this.WEDNESDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle').addClass('inline').end()
            .start(this.WEDNESDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedWednesday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedWednesday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedThursday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.ThursdayLabel).addClass('businessHourLabels').end()
            .start(this.THURSDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle').addClass('inline').end()
            .start(this.THURSDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedThursday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedThursday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedFriday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.FridayLabel).addClass('businessHourLabels').end()
            .start(this.FRIDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle').addClass('inline').end()
            .start(this.FRIDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedFriday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedFriday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedSaturday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.SaturdayLabel).addClass('businessHourLabels').end()
            .start(this.SATURDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle').addClass('inline').end()
            .start(this.SATURDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedSaturday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedSaturday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().addClass('dayOfWeekDiv').addClass(this.checkBoxClosedSunday$.map(function(e) { return e ? 'hide' : 'show' }))
            .start().add(this.SundayLabel).addClass('businessHourLabels').end()
            .start(this.SUNDAY_START_TIME).end()
            .start().add(this.ToLabel).addClass('labelTitle').addClass('inline').end()
            .start(this.SUNDAY_END_TIME).end()
          .end()
          .start().addClass('inline').addClass(this.checkBoxClosedSunday$.map(function(e) { return e ? 'alignClosedBoxLeft' : '' }))
            .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxClosedSunday$ })
            .add('Closed').addClass('closed-text')
          .end()
          .start().add(this.SAVE_BUTTON).end()
        .end()
      .end();
    },
    function setDaysClosed() {
      if( this.checkBoxClosedSunday ) {
        this.sundayStartTime = '';
        this.sundayEndTime = '';
      }
      if ( this.checkBoxClosedMonday ) {
        this.mondayStartTime = '';
        this.mondayEndTime = '';
      }
      if ( this.checkBoxClosedTuesday ) {
        this.tuesdayStartTime = '';
        this.tuesdayEndTime = '';
      }
      if ( this.checkBoxClosedWednesday ) {
        this.wednesdayStartTime= '';
        this.wednesdayEndTime = '';
      }
      if ( this.checkBoxClosedThursday ) {
        this.thursdayStartTime = '';
        this.thursdayEndTime = '';
      }
      if ( this.checkBoxClosedFriday ) {
        this.fridayStartTime = '';
        this.fridayEndTime = '';
      }
      if ( this.checkBoxClosedSaturday ) {
        this.saturdayStartTime = '';
        this.saturdayEndTime = '';
      }
    },
    function timeRegex() {
      var regex = new RegExp('\([0-2][0-9]):([0-5][0-9])$');

      if ( this.sundayStartTime != ''    && ! regex.test(this.sundayStartTime)     ||
           this.sundayEndTime != ''      && ! regex.test(this.sundayEndTime)       ||
           this.mondayStartTime != ''    && ! regex.test(this.mondayStartTime)     ||
           this.mondayEndTime != ''      && ! regex.test(this.mondayEndTime)       ||
           this.tuesdayStartTime != ''   && ! regex.test(this.tuesdayStartTime)    ||
           this.tuesdayEndTime != ''     && ! regex.test(this.tuesdayEndTime)      ||
           this.wednesdayStartTime != '' && ! regex.test(this.wednesdayStartTime)  ||
           this.wednesdayEndTime != ''   && ! regex.test(this.wednesdayEndTime)    ||
           this.thursdayStartTime != ''  && ! regex.test(this.thursdayStartTime)   ||
           this.thursdayEndTime != ''    && ! regex.test(this.thursdayEndTime)     ||
           this.fridayStartTime != ''    && ! regex.test(this.fridayStartTime)     ||
           this.fridayEndTime != ''      && ! regex.test(this.fridayEndTime)       ||
           this.saturdayStartTime != ''  && ! regex.test(this.saturdayStartTime)   ||
           this.saturdayEndTime != ''    && ! regex.test(this.saturdayEndTime)      ) {
        return false;
      }
      return true;
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

        if( ! X.timeRegex() ) {
          X.notify('Please input time in 24 hour format when using safari, eg. 01:00 PM -> 13:00', '', self.LogLevel.ERROR, true);
          return;
        }

        X.setDaysClosed();

        var sundayHours = this.Hours.create({
          day: this.DayOfWeek.SUNDAY,
          open: ! this.checkBoxClosedSunday,
          startTime: this.sundayStartTime,
          endTime: this.sundayEndTime
        });
        var mondayHours = this.Hours.create({
          day: this.DayOfWeek.MONDAY,
          open: ! this.checkBoxClosedMonday,
          startTime: this.mondayStartTime,
          endTime: this.mondayEndTime
        });
        var tuesdayHours = this.Hours.create({
          day: this.DayOfWeek.TUESDAY,
          open: ! this.checkBoxClosedTuesday,
          startTime: this.tuesdayStartTime,
          endTime: this.tuesdayEndTime
        });
        var wednesdayHours = this.Hours.create({
          day: this.DayOfWeek.WEDNESDAY,
          open: ! this.checkBoxClosedWednesday,
          startTime: this.wednesdayStartTime,
          endTime: this.wednesdayEndTime
        });
        var thursdayHours = this.Hours.create({
          day: this.DayOfWeek.THURSDAY,
          open: ! this.checkBoxClosedThursday,
          startTime: this.thursdayStartTime,
          endTime: this.thursdayEndTime
        });
        var fridayHours = this.Hours.create({
          day: this.DayOfWeek.FRIDAY,
          open: ! this.checkBoxClosedFriday,
          startTime: this.fridayStartTime,
          endTime: this.fridayEndTime
        });
        var saturdayHours = this.Hours.create({
          day: this.DayOfWeek.SATURDAY,
          open: ! this.checkBoxClosedSaturday,
          startTime: this.saturdayStartTime,
          endTime: this.saturdayEndTime
        });

        businessHoursArray.push(
          sundayHours,
          mondayHours,
          tuesdayHours,
          wednesdayHours,
          thursdayHours,
          fridayHours,
          saturdayHours
        );

        this.user.address.hours = businessHoursArray;

        this.userDAO.put(this.user).then(function (response) {
          self.user.copyFrom(response);
          X.notify('Business hours successfully saved.', '', self.LogLevel.INFO, true);
        }).catch(function (error) {
          X.notify(error.message, '', self.LogLevel.ERROR, true);
        });
      }

    }
  ]

});
