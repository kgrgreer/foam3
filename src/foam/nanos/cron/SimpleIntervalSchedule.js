/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'SimpleIntervalSchedule',

  javaImports: [
    'foam.nanos.cron.MonthlyChoice',
    'foam.nanos.cron.ScheduleEnd',
    'foam.time.TimeUnit',
    'java.time.DayOfWeek',
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.time.temporal.ChronoUnit',
    'java.time.temporal.TemporalAdjusters',
    'java.util.Date'
  ],

  implements: [
    'foam.nanos.cron.Schedule'
  ],

  messages: [
    { name: 'START_DATE_ERROR', message: 'Start Date must be after today' },
    { name: 'ENDS_ON_ERROR', message: 'End Date must be after start date' },
    { name: 'INVALID_DATE_ERROR', message: 'Please provide the date' },
    { name: 'INVALID_REPEAT_100', message: 'Please chose a value less than 100' },
    { name: 'INVALID_REPEAT_1', message: 'Please chose a value greater than 0' }
],

  requires: [
    'foam.time.DayOfWeek',
    'foam.time.TimeUnit',
    'foam.nanos.cron.MonthlyChoice',
    'foam.nanos.cron.ScheduleEnd',
    'foam.nanos.cron.SymbolicFrequency'
  ],

  css: `
    .sectioned-detail-property-disclaimer {
      text-align: center;
      font-style: italic;
    }
  `,

  properties: [
    {
      class: 'Date',
      name: 'startDate',
      columnLabel: 'Start on',
      gridColumns: 12,
      validateObj: function(startDate) {

        if ( ! startDate ) return this.INVALID_DATE_ERROR;
        // check against current date
        if ( startDate <= new Date() ) return this.START_DATE_ERROR;
      },
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        if ( ! value || ! obj  ) return;
        this.style({ 'font-weight': '600' }).add(obj.formatDate(value));
      }
    },
    {
      class: 'Int',
      name: 'repeat',
      label: 'Repeat Every',
      gridColumns: 6,
      min: 0,
      postSet: function(_, n) {
        if ( n === 0 ) {
          this.frequency = this.Frequency.DAY;
          this.ends = this.ScheduleEnd.NEVER;
        }
      },
      validationPredicates: [
        {
          args: ['repeat'],
          query: 'repeat<100',
          errorMessage: 'INVALID_REPEAT_100'
        },
        {
          args: ['repeat'],
          query: 'repeat>=1',
          errorMessage: 'INVALID_REPEAT_1'
        }
      ],
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        if ( ! value || ! obj ) return;
        let ret = value + ' ' + obj.frequency.label;
        this.style({ 'font-weight': '600' }).add( value > 1 ? ret + 's' : ret );
      }
    },
    {
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      name: 'frequency',
      label: 'Frequency',
      view: function(_, X) {
        var arr = ['Day', 'Week', 'Month', 'Year'];
        var choices = X.data.typeOfLabel$.map(type => {
          return ( type == 'singular' ) ? arr.map(v => [v, v]) : arr.map(v => [v, v + 's']);
        });

        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: choices,
          data$: X.data.frequency$
        }
      },
      gridColumns: 6,
      visibility: function(repeat) {
        if ( repeat < 1 ) {
          return foam.u2.DisplayMode.DISABLED};
        return foam.u2.DisplayMode.RW;
      },
      tableCellFormatter: function(value) {
        if ( ! value ) return;
        this.style({ 'font-weight': '600' }).add( value == foam.time.TimeUnit.DAY ? 'Daily' : value.label + 'ly');
      }
    },
    {
      class: 'String',
      name: 'typeOfLabel',
      documentation: `An internal prop used to change labels on the choiceView for frequency
        in the scheduled transfer depending on singular or plural frequency(repeat)
        e.g.  1 Week, 2 Weeks `,
      hidden: true,
      expression: function(repeat) {
        return repeat > 1 ? 'plural' : 'singular';
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.time.DayOfWeek',
      name: 'dayOfWeek',
      label: 'On',
      view: {
        class: 'foam.u2.view.DayOfWeekView',
      },
      visibility: function(frequency) {
        if ( frequency != this.TimeUnit.WEEK )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      },
      tableCellFormatter: function(value) {
        if ( ! value ) return;
        value.sort((a, b) => a.ordinal - b.ordinal);
        this.style({ 'font-weight': '600' }).add(value.map(d => d.label).join(', '));
      }
    },
    {
      class: 'Enum',
      of: 'foam.nanos.cron.MonthlyChoice',
      name: 'monthlyChoice',
      label: '',
      view: function(_, X) {
        return {
          isHorizontal: true,
          class: 'foam.u2.view.RadioEnumView'
        };
      },
      visibility: function(frequency) {
        if ( frequency != this.TimeUnit.MONTH )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      },
      hidden: true
    },
    {
      class: 'Array',
      of: 'Int',
      name: 'dayOfMonth',
      label: '',
      columnLabel: 'Repeat each',
      view: {
        class: 'foam.u2.view.DayOfMonthView'
      },
      visibility: function(monthlyChoice, frequency) {
        if ( frequency != this.TimeUnit.MONTH )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice != this.MonthlyChoice.EACH )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      },
      tableCellFormatter: function(values) {
        if ( ! values ) return;

        var ordinalNumbers = [];
        // Sort numbers in ascending order
        values.sort((a, b) => a - b).map((value) => {
          if ( value === 1 || value === 21 || value === 31 ) {
            ordinalNumbers.push(value + 'st');
          } else if ( value === 2 || value === 22 ) {
            ordinalNumbers.push(value + 'nd');
          } else if ( value === 3 || value === 23 ) {
            ordinalNumbers.push(value + 'rd');
          } else {
            ordinalNumbers.push(value + 'th');
          }
        });
        // Add commas, e.g. 1st, 2nd, 3rd, 4th
        this.style({ 'font-weight': '600' }).add(ordinalNumbers.map(o => o).join(', '));
      }
    },
    {
      class: 'String',
      name: 'disclaimer',
      value: 'For months without 29,30,31 the schedule will be skipped',
      label: '',
      visibility: function(monthlyChoice, frequency) {
        if ( frequency != this.TimeUnit.MONTH )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice != this.MonthlyChoice.EACH )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RO;
      }
    },
    {
      // first , second , third ...
      class: 'Enum',
      of: 'foam.nanos.cron.SymbolicFrequency',
      name: 'symbolicFrequency',
      label: '',
      columnLabel: 'Repeat on the',
      gridColumns: 6,
      visibility: function(monthlyChoice, frequency ) {
        if ( frequency != this.TimeUnit.MONTH )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice !=  this.MonthlyChoice.ON_THE )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      },
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        if ( ! value || ! obj ) return;
        this.style({ 'font-weight': '600' }).add(value.label + ' ' + obj.expandedDayOfWeek.label);
      }
    },
    {
      class: 'Enum',
      of: 'foam.time.DayOfWeek',
      name: 'expandedDayOfWeek',
      label: '',
      hidden: true,
      gridColumns: 6,
      visibility: function(monthlyChoice, frequency) {
        if ( frequency != this.TimeUnit.MONTH )
          return foam.u2.DisplayMode.HIDDEN;
        if ( monthlyChoice != this.MonthlyChoice.ON_THE )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Enum',
      of: 'foam.nanos.cron.ScheduleEnd',
      name: 'ends',
      label: 'Ends',
      gridColumns: 6,
      hidden: true,
      visibility: function(repeat) {
        if ( repeat < 1 ) {
          return foam.u2.DisplayMode.HIDDEN};
        return foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Date',
      name: 'endsOn',
      label: 'End Date',
      columnLabel: 'Ends',
      gridColumns: 6,
      visibility: function(ends) {
        if ( ends != this.ScheduleEnd.ON )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      },
      validateObj: function(endsOn) {
        if ( ! endsOn ) return this.INVALID_DATE_ERROR;
        // check against start date
        if ( endsOn <= this.startDate ) return this.ENDS_ON_ERROR;
      },
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        if ( ! value || ! obj  ) return;
        this.style({ 'font-weight': '600' }).add('On ' + obj.formatDate(value));
      }
    },
    {
      class: 'Int',
      name: 'endsAfter',
      label: 'Occurrences',
      columnLabel: 'Ends',
      gridColumns: 6,
      min: 1,
      visibility: function(ends) {
        if ( ends != this.ScheduleEnd.AFTER )
          return foam.u2.DisplayMode.HIDDEN;
        return foam.u2.DisplayMode.RW;
      },
      tableCellFormatter: function(value) {
        let ret = 'After ' + value + ' occurrence';
        this.style({ 'font-weight': '600' }).add(value > 1 ? ret + 's' : ret);
      }
    },
    {
      class: 'String',
      name: 'note',
      columnLabel: '',
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        let nextDates = obj.calculateNextDates_(2);
        let ordinal;

        for ( var i = 0; i < nextDates.length; i++ ) {
          if ( nextDates[i] == null ) break;
          if ( i == 0 ) {
            ordinal = 'first';
          } else if ( i == 1 ) {
            ordinal = 'second';
          }
          value += `Your ${ordinal} scheduled deposit is on ${obj.formatDate(nextDates[i])}.`;
          value += '\n';
        }
        this.addClass('p-label', 'note').add(value);
      }
    },
    {
      class: 'Boolean',
      name: 'applyWait',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'useDateAsMinimumDate',
      hidden: true
    }
  ],

  methods: [
    // Get formatted Date: e.g., 2022/10/10
    function formatDate(date) {
      if ( ! date ) return;
      return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    },

    // Get n times next scheduled dates
    // e.g., if n is 2, Oct 06 2022, Oct 08 2022
    function calculateNextDates_(n) {
      if ( n > 100 ) n = 100;

      let ends = this.endsAfter;
      if (this.ends != this.ScheduleEnd.AFTER || ends > n ) {
        ends = n;
      }

      let dates = Array(n).fill(null);
      let date = this.calculateNextDate_(new Date(), false);

      for ( let i = 0; i < ends; i++ ) {
        if ( date == null ) break;
        dates[i] = date;
        date = this.calculateNextDate_(date, true);
      }
      return dates;
    },

    // Calculate next scheduled date based on daily, weekly, monthly, or yearly
    function calculateNextDate_(date, useDateAsMinimumDate) {
      let startDate = this.startDate;
      let minimumDate;

      if ( useDateAsMinimumDate ) {
        minimumDate = date;
      } else {
        minimumDate = new Date();
      }

      let endsOn =  this.endsOn ? undefined : this.endsOn;
      let nextDate = new Date(startDate);

      if ( this.ends == this.ScheduleEnd.AFTER && this.endsAfter == 0 ||
        this.ends == this.ScheduleEnd.ON && minimumDate > this.endsOn ) return;

      switch (this.frequency.name) {
        case 'DAY':
          nextDate = this.calculateNextDay_(nextDate, false, startDate, minimumDate);
          break;
        case 'WEEK':
          nextDate = this.calculateNextWeek_(nextDate, false, startDate, minimumDate);
          break;
        case 'MONTH':
          nextDate = this.calculateNextMonth_(nextDate, false, startDate, minimumDate);
          break;
        case 'YEAR':
          nextDate = this.calculateNextYear_( nextDate, false, startDate, minimumDate);
          break;
      }

      if ( nextDate == null || this.ends == this.ScheduleEnd.ON && nextDate > this.endsOn ) {
        return;
      }
      return nextDate;
    },

    // Get next scheduled date, based on the n repeat Year
    // e.g., if repeat is 2 and startDate is Oct 06 2022, the next scheduled date is Oct 06, 2024
    function calculateNextYear_( nextDate, applyWait, startDate, minimumDate) {
      if ( applyWait ) {
        nextDate.setFullYear(nextDate.getFullYear() + this.repeat);
      }
      if ( nextDate > minimumDate && nextDate > startDate ) {
        return nextDate;
      }
      return this.calculateNextYear_( nextDate, true, startDate, minimumDate);
    },

    // Get next scheduled date, based on the n repeat Month(s) and monthlyChoice(ON_THE or EACH)
    function calculateNextMonth_(nextDate, applyWait, startDate, minimumDate) {
      if ( applyWait ) {
        // Add n repeat month(s)
        nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + this.repeat));
      }
      const start = this.getFirstDayOfMonth(nextDate);
      const end = this.getLastDayOfMonth(nextDate);

      // e.g., repeat(2), startDate(Oct 06 2022), dayOfMonth([1, 3, 5])
      // nextDate will be Dec 1 2022
      if ( this.monthlyChoice == this.MonthlyChoice.EACH ) { // EACH
        nextDate = new Date();
        var days = this.dayOfMonth;
        for ( var i = 0; i < days.length; i++ ) {
          let temp = this.getPlusDays(start, (days[i] - 1));
          if ( temp > minimumDate && temp < nextDate && temp > startDate ||
            nextDate <= minimumDate || nextDate < startDate ) {
            nextDate = temp;
          }
        }
      } else {
        // e.g., repeat(2), startDate(Oct 06 2022), symbolicFrequency(FIRST), dayOfWeek(MONDAY)
        // nextDate will be Monday Dec 5 2022
        let weekDayVal;
        switch (this.symbolicFrequency.name) { // ON_THE
          case 'FIRST':
            // e.g., if expandedDayOfWeek is SUNDAY, weekDayVal will be 0
            weekDayVal = this.getWeekDayVal(this.expandedDayOfWeek.name);
            nextDate = this.getDayOfWeekInMonth(nextDate, 1, weekDayVal);
            break;
          case 'SECOND':
            weekDayVal = this.getWeekDayVal(this.expandedDayOfWeek.name);
            nextDate = this.getDayOfWeekInMonth(nextDate, 2, weekDayVal);
            break;
          case 'THIRD':
            weekDayVal = this.getWeekDayVal(this.expandedDayOfWeek.name);
            nextDate = this.getDayOfWeekInMonth(nextDate, 3, weekDayVal);
            break;
          case 'BEFORE_LAST':
            weekDayVal = this.getWeekDayVal(this.expandedDayOfWeek.name);
            nextDate = this.getLastInMonth_(nextDate, weekDayVal);
            nextDate = this.getPlusDays(nextDate, -7);
            break;
          case 'LAST':
            weekDayVal = this.getWeekDayVal(this.expandedDayOfWeek.name);
            nextDate = this.getLastInMonth_(nextDate, weekDayVal);
            break;
        }
      }
      if ( nextDate > startDate && nextDate > minimumDate ) {
        return nextDate;
      }
      return this.calculateNextMonth_(start, true, startDate, minimumDate);
    },

    // Get next scheduled date, based on the n repeat Week(s) and day(s) of the week
    function calculateNextWeek_(nextDate, applyWait, startDate, minimumDate) {
      if ( applyWait ) {
        nextDate.setDate(nextDate.getDate() + (this.repeat * 7));
      }

      let start = this.getStartOfWeek_(nextDate);
      let minDate = new Date(start.setDate(start.getDate() - 1));
      let endOfWeek = this.getEndDate_(minDate);

      let days = this.dayOfWeek;
      if ( days.length == 0 ) return;

      // e.g. MONDAY will return 1
      let dateVal = this.getWeekDayVal(days[0].name);
      nextDate = this.getNextDayOfWeek(minDate, dateVal);

      for ( var i  = 1; i < days.length; i++ ) {
        dateVal = this.getWeekDayVal(days[i].name);
        let temp = this.getNextDayOfWeek(minDate, dateVal);
        if ( temp > minimumDate && temp < nextDate && temp > startDate || nextDate <= minimumDate ) {
          nextDate = temp;
        }
      }

      if ( nextDate > startDate && nextDate > minimumDate && nextDate < endOfWeek ) {
        return nextDate;
      } else {
        return this.calculateNextWeek_(endOfWeek, true, startDate, minimumDate);
      }
    },

    // Get next scheduled date, based on the n repeat Day(s)
    function calculateNextDay_(nextDate, applyWait, startDate, minimumDate) {
      if ( applyWait ) {
        nextDate.setDate(nextDate.getDate() + this.repeat);
      }
      if ( nextDate > minimumDate && nextDate > startDate ) {
        return nextDate;
      }
      return this.calculateNextDay_(nextDate, true, startDate, minimumDate);
    },

    // Helper function for calculateNextMonth_()
    function getFirstDayOfMonth(date) {
      if ( ! date ) return;
      return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    // Helper function for calculateNextMonth_()
    function getLastDayOfMonth(date) {
      if ( ! date ) return;
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    },

    // Return a copy of date with the specified days added
    // e.g., 2022-12-31 plus one day would result in 2023-01-01
    function getPlusDays(date, numOfDaysToAdd) {
      if ( ! date ) return;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + numOfDaysToAdd);
    },

    // Helper function for calculateNextMonth_()
    // date(Oct 6 2022), nth: first(0), weekDayVal(1), repeat: 2 months
    // result will be Monday Dec 5 2022
    function getDayOfWeekInMonth(date, nth, weekDayVal) {
      date.setMonth(date.getMonth() + 1);
      let year = date.getFullYear();
      let month = date.getMonth();

      date = new Date(year, month - 1, 7 * (nth - 1) + 1);
      let nthMonthDate =  new Date(date.setMonth(date.getMonth() + this.repeat));
      return this.getNextDayOfWeek(nthMonthDate, weekDayVal);
    },

    /*
    Helper function for calculateNextMonth_()
    Get last weekday of the month
    e.g., get last weekday Monday of Oct 2022 => Oct 31 2022,
    weekDayVal(0): Sunday, weekDayVal(1): Monday
    */
    function getLastInMonth_(date, weekDayVal) {
      let year = date.getFullYear();
      let month = date.getMonth() + 1 + this.repeat;// getMonth() starts with 0
      date = new Date(year, month, 1);
      // Subtract dateDiff from the first day of the next month
      // e.g., date(Jan 1 2023) - dateDiff(6) = Dec 26 2022
      let dateDiff = ((date.getDay() + (6 - weekDayVal)) % 7) + 1;
      date.setDate(date.getDate() - dateDiff);
      return date;
    },

    // e.g., date(Oct 3 2022), dateVal(3)
    // Return next day of the week having Wednesday for date Oct 3 2022 is: Oct 5 2022
    function getNextDayOfWeek(date, dateVal, weekToSubtract) {
      if ( weekToSubtract ) {
        date.setDate(date.getDate() - (7 * weekToSubtract)); // minus #ofweek
      }
      let nextDate = new Date(date.getTime());
      nextDate.setDate(date.getDate() + (7 + dateVal - date.getDay()) % 7);
      if ( date.getTime() == nextDate.getTime() ) {// if they are the same day.
        nextDate.setDate(date.getDate() + 7);
      }
      return nextDate;
    },

    // Helper function for calculateNextWeek_() to get Sunday as a start day
    function getStartOfWeek_(date) {
      // dateVal: Sunday
      return this.getNextDayOfWeek(date, 0, 1);
    },

    // Helper function for calculateNextWeek_() to get Saturday as an end day
    function  getEndDate_(date) {
      // dateVal: Saturday
      return this.getNextDayOfWeek(date, 6);
    },

    // Return an integer corresponding to the day of the week string:
    // 'Sunday' for 0, 'Monday' for 1, 'Tuesday' for 2, and so on
    function getWeekDayVal(day) {
      switch ( day ) {
        case 'SUNDAY':
          return 0;
        case 'MONDAY':
          return 1
        case 'TUESDAY':
          return 2;
        case 'WEDNESDAY':
          return 3;
        case 'THURSDAY':
          return 4;
        case 'FRIDAY':
          return 5;
        case 'SATURDAY':
          return 6;
      }
    },
    {
      name: 'getNextScheduledTime',
      javaCode: `
        return calculateNextDate(x,from,false);
      `
    },
    {
      name: 'calculateNextDate',
      type: 'Date',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'date',
          type: 'Date'
        },
        {
          name: 'useDateAsMinimumDate',
          type: 'boolean'
        }
      ],
      javaCode: `
        LocalDate startDate = getStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate minimumDate = null;
        if ( useDateAsMinimumDate ) {
          minimumDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        } else {
          minimumDate = LocalDate.now();
        }
        LocalDate endsOn = getEndsOn() == null ? null : getEndsOn().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate nextDate = startDate;

        // Check if schedule has ended
        if ( getEnds() == ScheduleEnd.AFTER && getEndsAfter() == 0 || getEnds() == ScheduleEnd.ON && ! minimumDate.isBefore(endsOn) ) {
          return null;
        }

        switch (getFrequency()) {
          case DAY:
            nextDate = calculateNextDay(x, nextDate, false, startDate, minimumDate);
            break;
          case WEEK:
            nextDate = calculateNextWeek(x, nextDate, false, startDate, minimumDate);
            break;
          case MONTH:
            nextDate = calculateNextMonth(x, nextDate, false, startDate, minimumDate);
            break;
          case YEAR:
            nextDate = calculateNextYear(x, nextDate, false, startDate, minimumDate);
            break;
        }

        // check if next schedulable date is before the schedule's end date if one exists
        if ( nextDate == null || getEnds() == ScheduleEnd.ON && ! nextDate.isBefore(endsOn) ) {
          return null;
        }

        return Date.from(nextDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
      `
    },
    {
      name: 'calculateNextDay',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'nextDate',
          type: 'LocalDate'
        },
        {
          name: 'applyWait',
          type: 'boolean'
        },
        {
          name: 'startDate',
          type: 'LocalDate'
        },
        {
          name: 'minimumDate',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusDays(getRepeat());
        }
        if ( nextDate.isAfter(minimumDate) && ! nextDate.isBefore(startDate) ) {
          return nextDate;
        }
        return calculateNextDay(x, nextDate, true, startDate, minimumDate);
      `
    },
    {
      name: 'calculateNextWeek',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'nextDate',
          type: 'LocalDate'
        },
        {
          name: 'applyWait',
          type: 'boolean'
        },
        {
          name: 'startDate',
          type: 'LocalDate'
        },
        {
          name: 'minimumDate',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusWeeks(getRepeat());
        }
        LocalDate minDate = getStartOfWeek(x,nextDate).minusDays(1);
        LocalDate endOfWeek = getEndOfWeek(x,minDate);
        foam.time.DayOfWeek[] days = getDayOfWeek();
        if ( days.length == 0 ) {
          return null;
        }
        nextDate = minDate.with(TemporalAdjusters.next(getWeekday(days[0])));
        for ( int i=1; i < days.length; i++ ) {
          LocalDate temp = minDate.with(TemporalAdjusters.next(getWeekday(days[i])));
          if ( temp.isAfter(minimumDate) && (temp.isBefore(nextDate) && ! temp.isBefore(startDate) || ! nextDate.isAfter(minimumDate) || nextDate.isBefore(startDate)) ) {
            nextDate = temp;
          }
        }
        if ( ! nextDate.isBefore(startDate) && nextDate.isAfter(minimumDate) && ! nextDate.isAfter(endOfWeek) ) {
          return nextDate;
        } else {
          return calculateNextWeek(x, endOfWeek, true, startDate, minimumDate);
        }
      `
    },
    {
      name: 'calculateNextMonth',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'nextDate',
          type: 'LocalDate'
        },
        {
          name: 'applyWait',
          type: 'boolean'
        },
        {
          name: 'startDate',
          type: 'LocalDate'
        },
        {
          name: 'minimumDate',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusMonths(getRepeat());
        }
        LocalDate start = nextDate.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate end = nextDate.with(TemporalAdjusters.lastDayOfMonth());

        if ( getMonthlyChoice() == MonthlyChoice.EACH ) {
          nextDate = LocalDate.now();

          for ( Object day : getDayOfMonth() ) {
            LocalDate temp = start.plusDays(((long)day)-1);
            if ( temp.isAfter(minimumDate) && (temp.isBefore(nextDate) && ! temp.isBefore(startDate) || ! nextDate.isAfter(minimumDate) || nextDate.isBefore(startDate)) ) {
              nextDate = temp;
            }
          }
        } else {
          switch (getSymbolicFrequency()) {
            case FIRST:
              nextDate = nextDate.with(TemporalAdjusters.dayOfWeekInMonth(1,getWeekday(getExpandedDayOfWeek())));
              break;
            case SECOND:
              nextDate = nextDate.with(TemporalAdjusters.dayOfWeekInMonth(2,getWeekday(getExpandedDayOfWeek())));
              break;
            case THIRD:
              nextDate = nextDate.with(TemporalAdjusters.dayOfWeekInMonth(3,getWeekday(getExpandedDayOfWeek())));
              break;
            case BEFORE_LAST:
              nextDate = nextDate.with(TemporalAdjusters.lastInMonth(getWeekday(getExpandedDayOfWeek())));
              nextDate = nextDate.minusDays(7);
              break;
            case LAST:
              nextDate = nextDate.with(TemporalAdjusters.lastInMonth(getWeekday(getExpandedDayOfWeek())));
              break;
          }
        }
        if ( ! nextDate.isBefore(startDate) && nextDate.isAfter(minimumDate) && ! nextDate.isAfter(end) ) {
          return nextDate;
        }
        return calculateNextMonth(x, start, true, startDate, minimumDate);
      `
    },
    {
      name: 'calculateNextYear',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'nextDate',
          type: 'LocalDate'
        },
        {
          name: 'applyWait',
          type: 'boolean'
        },
        {
          name: 'startDate',
          type: 'LocalDate'
        },
        {
          name: 'minimumDate',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        if ( applyWait ) {
          nextDate = nextDate.plusYears(getRepeat());
        }
        if ( nextDate.isAfter(minimumDate) && ! nextDate.isBefore(startDate) ) {
          return nextDate;
        }
        return calculateNextYear(x, nextDate, true, startDate, minimumDate);
      `
    },

    // helper methods to get formatted frequency/start/end fields
    // todo implement properly
    {
      name: 'getFrequency',
      code: function() {
        return 'every ' + this.repeat + ' ' + this.frequency;
      }
    },
    {
      name: 'getStartDate',
      code: function() {
        return this.START_DATE.format(this.startDate);
      }
    },
    {
      name: 'getEndDate',
      code: function() {
        return this.ends + ' ' + ( this.ends == this.ScheduleEnd.ON ? this.ENDS_ON.format(this.endsOn) : this.endsAfter )
      }
    },
    {
      name: 'getWeekday',
      type: 'DayOfWeek',
      args: [
        {
          type: 'foam.time.DayOfWeek',
          name: 'day'
        }
      ],
      javaCode: `
        if ( day == foam.time.DayOfWeek.MONDAY ) {
          return DayOfWeek.MONDAY;
        } else if ( day == foam.time.DayOfWeek.TUESDAY ) {
          return DayOfWeek.TUESDAY;
        } else if ( day == foam.time.DayOfWeek.WEDNESDAY ) {
          return DayOfWeek.WEDNESDAY;
        } else if ( day == foam.time.DayOfWeek.THURSDAY ) {
          return DayOfWeek.THURSDAY;
        } else if ( day == foam.time.DayOfWeek.FRIDAY ) {
          return DayOfWeek.FRIDAY;
        } else if ( day == foam.time.DayOfWeek.SATURDAY ) {
          return DayOfWeek.SATURDAY;
        }else {
          return DayOfWeek.SUNDAY;
        }
      `
    },
    {
      name: 'postExecution',
      javaCode: `
        int endsAfter = getEndsAfter();
        if ( endsAfter > 0 ) {
          setEndsAfter(--endsAfter);
        }
      `
    },
    {
      name: 'getEndOfWeek',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'date',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        // Todo change end of week based off country
        return date.with(TemporalAdjusters.next(DayOfWeek.SATURDAY));
      `
    },
    {
      name: 'getStartOfWeek',
      type: 'java.time.LocalDate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'date',
          type: 'LocalDate'
        }
      ],
      javaCode: `
        // Todo change start of week based off country
        return date.minusWeeks(1).with(TemporalAdjusters.next(DayOfWeek.SUNDAY));
      `
    },
    {
      name: 'calculateNextDates',
      type: 'Date[]',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'n',
          type: 'int'
        }
      ],
      javaCode: `
        if ( n > 100 ) {
          n = 100;
        }
        int ends = getEndsAfter();
        if ( getEnds() != ScheduleEnd.AFTER || ends > n ) {
          ends = n;
        }
        Date[] dates = new Date[n];
        Date date = calculateNextDate(x, new Date(), false);
        for ( int i = 0; i < ends; i++ ) {
          if ( date == null ) {
            break;
          }
          dates[i] = date;
          date = calculateNextDate(x, date, true);
        }
        return dates;
      `
    }
  ]
});
