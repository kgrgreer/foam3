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
    },

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
      name: 'employee',
      value: true
    },
    {
      class: 'Int',
      name: 'salary',
      units: 'CAD$'
    },
    {
      class: 'String',
      name: 'jobTitle'
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
      description: 'Date of birth.'
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
      extends: 'foam.u2.View',
      properties: [ 'prop', 'args' ],
      methods: [
        function xxxtoE(args, X) {
          return foam.u2.DetailPropertyView.create({prop: this.prop}, this);
        },

        function render() {
          var prop = this.prop;

          this.
            addClass(this.myClass()).

            style({'padding-top': '8px'}).

            start('div').style({'padding-bottom': '2px'}).add(prop.label).end().

            start('div').
              style({display: 'flex'}).
              add(prop.toE_(this.args, this)).
              callIf(prop.units, function() {
                this.start().
                  style({'padding-left': '4px', 'align-self': 'center'}).
                  add(prop.units).
                end();
              }).
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
            add(data.EMPLOYEE, data.JOB_TITLE, data.SALARY).
          end().
        end().
        start(FoldingSection, {title: 'Employee Information'}).
          add(data.EMPLOYEE, data.JOB_TITLE, data.SALARY).
        end();
    }
  ]
});

// Bug: Borders don't pass down Context properly

E('br').write();
E('hr').write();
E('br').write();

var user = User.create({lastName: 'Greer'});
CustomUserDetailView.create({of: User, data: user}).write();
foam.u2.DetailView.create({data: user, showActions: true}).write();
user.firstName = 'Kevin';
