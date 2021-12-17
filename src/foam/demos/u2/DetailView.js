/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var timer = foam.util.Timer.create();
timer.start();

var E = foam.__context__.E.bind(foam.__context__);

/*

foam.u2.DetailView.create({
  data: foam.util.Timer.create(),
  showActions: true
})..write();

foam.u2.DetailView.create({
  data: foam.util.Timer.create(),
  showActions: true,
  properties: [ foam.util.Timer.INTERVAL, foam.util.Timer.I ],
  actions: [ foam.util.Timer.STOP, foam.util.Timer.START ]
})..write();

*/
foam.CLASS({
  package: 'foam.util',
  name: 'TimerDetailView',
  extends: 'foam.u2.DetailView',

  requires: [
    'foam.util.Timer'
  ],

  // css: foam.u2.DetailView.model_.css,

  methods: [
    function render() {
      var self = this;
      this.startContext({data: this.data}).
        tag(this.DetailPropertyView, {prop: self.Timer.I}).
        tag(this.DetailPropertyView, {prop: self.Timer.INTERVAL}).
        add(self.Timer.STOP, self.Timer.START);
    },
    function layoutProperties(properties, self) {
      self.layoutProp(self.Timer.I, self);
      self.layoutProp(self.Timer.INTERVAL, self);
    }
  ]
});

E('br').write();
E('hr').write();
E('br').write();

E('h3').add('Custom DetailView').write();
foam.util.TimerDetailView.create({data: timer, showActions: true}).write();

E('h3').add('DetailView with data').write();
foam.u2.DetailView.create({data: timer, showActions: true}).write();

E('h3').add('DetailView with of and data').write();
foam.u2.DetailView.create({of: 'foam.util.Timer', data: timer, showActions: true}).write();

E('h3').add('DetailView with of').write();
foam.u2.DetailView.create({of: 'foam.util.Timer', showActions: true}).write();


E('br').write();
E('hr').write();
E('br').write();

foam.CLASS({
  name: 'User',

  properties: [
    {
      class: 'String',
      name: 'id',
      width: 12,
      documentation: 'Unique name of the Group.'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isEmployee',
      label: 'Employee',
      value: true
    },
    {
      class: 'Int',
      name: 'salary',
      units: 'CAD$',
      xxxvalidateObj: function(salary) {
        if ( salary && salary < 30000 ) throw 'Salary must be at least $30,000.';
      },
      visibility: function(isEmployee) {
        return isEmployee ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'jobTitle',
      visibility: function(isEmployee) {
        return isEmployee ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'EMail',
      name: 'email'
    },
    {
      class: 'Date',
      name: 'birthday',
      help: 'Date of birth.'
    },
    {
      class: 'String',
      name: 'title',
      width: 4
    },
    {
      class: 'String',
      name: 'address',
      width: 80
    },
    {
      class: 'String',
      name: 'City',
      width: 40
    },
    {
      class: 'String',
      name: 'region',
      label: 'Province',
      width: 4
    },
    {
      class: 'String',
      name: 'postalCode',
      width: 10
    },
    {
      class: 'String',
      name: 'country',
      width: 30
    }
  ]
});


foam.CLASS({
  name: 'CustomUserDetailView',
  extends: 'foam.u2.View',

  requires: [
    'User'
  ],

  classes: [
    /*
    Responsibilities:
      1. display property's view
      2. label
      3. units
      4. visibility
      5. validation
      6. tooltip
      7. help
      */

    {
      name: 'PropertyView',
      extends: 'foam.u2.Element', // isn't actually a View (no data), more like a border or wrapper
      properties: [ 'prop', 'args' ],
      methods: [
        function xxxtoE(args, X) {
          return foam.u2.DetailPropertyView.create({prop: this.prop}, this);
        },

        function createVisibilitySlot() {
          return this.prop.createVisibilityFor(
            this.__context__.data$,
            this.controllerMode$).map(m => m != foam.u2.DisplayMode.HIDDEN);
        },

        function render() {
          var prop = this.prop;

          if ( prop.help ) this.tooltip = prop.help;

          // Needs to be called after tooltip is set, which seems like a bug. KGR
          this.SUPER();

          var data = this.__context__.data;
          var view = prop.toE_(this.args, this.__subContext__);

          var errorSlot = prop.validateObj && prop.validationTextVisible ?
            data.slot(prop.validateObj) :
            foam.core.ConstantSlot.create({ value: null });

          this.
            addClass(this.myClass()).
            show(this.createVisibilitySlot()).
            style({'padding-top': '8px'}).

            start('div').style({'padding-bottom': '2px'}).add(prop.label).end().

            start('div').
              style({display: 'flex', 'flex-wrap': 'wrap'}).
              add(view).
              callIf(prop.units, function() {
                this.start().
                  style({'padding-left': '4px', 'align-self': 'center'}).
                  add(prop.units).
                end();
              }).
              start('div').
                style({'flex-basis': '100%', width: '0', color: 'red'}).
                show(errorSlot).
                br().
                add(errorSlot).
              end().
            end();
        }
      ]
    }
  ],

  // css: foam.u2.DetailView.model_.css,

  css: `
    ^ {
      padding: 8px;
      display: inline-block;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      margin: 8px;
    }
  `,

  methods: [
    function render() {
      this.SUPER();
      this.__subContext__.register(this.PropertyView, 'foam.u2.PropertyView');

      var self = this, data = this.data;

//      this.add(this.data.cls_.getAxiomsByClass(foam.core.Property).filter(p => ! p.hidden));

      this.
        start(LabelledSection, {title: 'User'}).
        addClass(this.myClass()).
        start(Columns).
          start(Column).
            add(data.ID, data.FIRST_NAME, data.EMAIL).
          end().
          start(Column).
            add(data.ENABLED, data.LAST_NAME, data.BIRTHDAY).
          end().
        end().
        br().
        start(Tabs).
          start(Tab, {label: 'Address'}).
            add(data.ADDRESS).
            start(Columns).
              start(Column).
                add(data.CITY, data.REGION).
              end().
              start(Column).
                add(data.POSTAL_CODE, data.COUNTRY).
              end().
            end().
          end().
          start(Tab, {label: 'Employee Information'}).
            add(data.IS_EMPLOYEE, data.JOB_TITLE, data.SALARY).
          end().
        end().
        start(FoldingSection, {title: 'Employee Information'}).
          add(data.IS_EMPLOYEE, data.JOB_TITLE, data.SALARY).
        end();
    }
  ]
});

// Bug: Borders don't pass down Context properly

E('br').write();
E('hr').write();
E('br').write();

var user = User.create({firstName: 'Kevin', lastName: 'Greer'});
CustomUserDetailView.create({of: User, data: user}).write();
foam.u2.DetailView.create({data: user, showActions: true}).write();

foam.u2.detail.SectionedDetailView.create({data: user, showActions: true}).write();
