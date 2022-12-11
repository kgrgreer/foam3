/**
 * NANOPAY CONFIDENTIAL
 *
 * [2022] nanopay Corporation
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
  package: 'foam.nanos.alarming',
  name: 'AlarmWidget',
  extends: 'foam.dashboard.view.Card',
  documentation: `widget that shows active Alarms`,

//  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'alarmDAO'
  ],

  requires: [
    'foam.u2.borders.CardBorder',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmCitationView'
  ],

  css: `
    ^ {
      height: 100%;
      width: 100%;
      border-radius: 0;
      box-shadow: none;
      background-color:transparent;
    }
    ^citation-wrapper > * + * {
      margin-top: 8px;
    }
    ^ .foam-u2-borders-CardBorder {
      min-height: 0;
      padding: 0 5px;
    }
    ^citation-wrapper > .foam-u2-borders-CardBorder {
      padding: 16px;
      box-shadow: 3px 8px 6px -2px $grey300;
      background: $white;
      border-radius: 10px;
      border: none;
    }
    ^noActiveAlarms {
      height: 100%;
    }
    ^titled-container {
      display: grid;
      grid-template-rows: 2em 1fr;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate'
    },
    {
      class: 'Long',
      name: 'limit',
      value: 4
    },
    {
      class: 'String',
      name: 'title',
      value: 'Active Alarms'
    },
    {
      class: 'String',
      name: 'redirectMenu'
    },
    {
      class: 'String',
      name: 'buttonText',
      value: 'View'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.alarming.Alarm',
      name: 'alarms'
    },
  ],

  methods: [
    // To prevent from calling super in the render method
    function init() {},
    function render() {
      var self = this;
      this.onDetach(this.dashboardController.sub('dashboard', 'update', this.fetchAlarms));
      this.fetchAlarms();
      this.addClass(this.myClass())
        .enableClass(this.myClass('titled-container'), this.title)
        .callIf(!!this.title, function () {
          this.start().addClasses([this.myClass('title'), 'h500']).translate(this.title, this.title).end()
        })
        .start(this.border, { data: this })
        .add(this.slot(function(alarms) {
          var el = this.E().addClass(self.myClass('citation-wrapper'));
          if ( this.alarms.length == 0 ) {
            el.start(self.CardBorder)
              .addClasses(['p', 'flexCenter', self.myClass('noActiveAlarms')])
              .add('No Active Alarms')
            .end();
          } else {
            alarms.forEach(obj => {
              el.start(self.CardBorder).tag(self.AlarmCitationView, {
                alarm: obj,
                buttonText: self.buttonText,
                redirectMenu: self.redirectMenu
              }).end();
            });
          }
          return el;
        }))
        .end();
    }
  ],

  listeners: [
    {
      name: 'fetchAlarms',
      code: async function() {
        var dao = this.alarmDAO;
        if ( this.predicate ) dao = dao.where(this.predicate);
        if ( this.limit > 0 ) dao = dao.limit(this.limit);
        var resp =  await dao.select();
        if ( foam.Array.equals(resp.array,this.alarms) )
          return;
        this.alarms = resp.array;
      }
    }
  ]
});

