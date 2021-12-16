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
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the Group.'
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
      class: 'String',
      name: 'title'
    },
    {
      class: 'String',
      name: 'address'
    },
    {
      class: 'String',
      name: 'City'
    },
    {
      class: 'String',
      name: 'region'
    },
    {
      class: 'String',
      name: 'postalCode'
    },
    {
      class: 'String',
      name: 'Country'
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
      // extends: 'foam.u2.View',
      properties: [ 'prop', 'args' ],
      methods: [
        function toE(args, X) {
          return foam.u2.DetailPropertyView.create({prop: this.prop}, this);

          var prop = this.prop;
          this.add(
            prop.label,
            ' ',
            prop.toE_(this.args, this));
          if ( prop.units ) {
            this.start('units').add(prop.units).end();
          }
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

      var self = this;

//      this.add(this.getAxiomsByClass(foam.core.Property).filter(p => ! p.hidden));

      this.
        addClass(this.myClass()).
        start(Columns).
          start(Column).start('table').
            add(this.data.ID, this.data.DESCRIPTION).
          end().end().
          start(Column).start('table').
            add(this.data.ENABLED).
          end().end().
        end().
        br().
        start(Tabs).
          start(Tab, {label: 'Address'}).
            start().style({'overflow-y': 'auto'}).
              startContext({data: this.data}).
                add(this.data.ADDRESS, this.data.CITY, this.data.REGION, this.data.POSTAL_CODE, this.data.COUNTRY).
              endContext().
            end().
          end().
          start(Tab, {label: 'Employee Information'}).
            start('table').add(this.data.EMPLOYEE, this.data.SALARY).end().
          end().
        end();
    }
  ]
});

// Bug: Borders don't pass down Context properly

E('br').write();
E('hr').write();
E('br').write();

CustomUserDetailView.create({of: User, data: User.create(), showActions: true}).write();
foam.u2.DetailView.create({data: User.create(), showActions: true}).write();
