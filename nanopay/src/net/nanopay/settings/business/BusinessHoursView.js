foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'BusinessHoursView',
  extends: 'foam.u2.View',

  documentation: 'View displaying business hours',

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
  }
    ^ .dayOfWeekDiv {
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
      pointer-events: none;
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

      this
      .addClass(this.myClass())
      .start().addClass('Container')
        .start().add('Business Hours').addClass('boxTitle').end()
        .start('div').addClass('toggleDiv')
          .tag({ class: 'net.nanopay.ui.ToggleSwitch', data$: this.businessHoursEnabled$ })
        .end()
        .start().addClass(this.businessHoursEnabled$.map(function(e) { return e ? 'show' : 'hide' }))
          .start().addClass('dayOfWeekDiv')
            .start().add(this.MondayLabel).addClass('businessHourLabels').end()
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
            .start().add(this.TuesdayLabel).addClass('businessHourLabels').end()
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
            .start().add(this.WednesdayLabel).addClass('businessHourLabels').end()
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
            .start().add(this.ThursdayLabel).addClass('businessHourLabels').end()
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
            .start().add(this.FridayLabel).addClass('businessHourLabels').end()
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
            .start().add(this.SaturdayLabel).addClass('businessHourLabels').end()
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
            .start().add(this.SundayLabel).addClass('businessHourLabels').end()
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
      .end();
    }
  ],

  actions: [
    {
      name: 'saveButton',
      label: 'Save',
      code: function (X) {
        // Save business hours
      }
    }
  ]
}); 