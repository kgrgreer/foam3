/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/*
  TODO:
    - help
    - required
    - more validation
*/

var E = foam.__context__.E.bind(foam.__context__);

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
      class: 'Date',
      name: 'created',
      // TODO: doesn't work
      visibility: foam.u2.DisplayMode.RO,
      factory: function() { return new Date(); }
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
      // TODO:
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
      value: 'Canada',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'Canada', 'United States' ] },
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
      properties: [
        'prop',
        'args',
        {
          name: 'label',
          factory: function() { return this.prop.label; }
        },
        {
          name: 'units',
          factory: function() { return this.prop.units; }
        },
        {
          name: 'view'
        }
      ],
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
            addClass().
            show(this.createVisibilitySlot()).
            style({'padding-top': '8px'}).

            start('div').style({'padding-bottom': '2px'}).add(this.label).end().

            start('div').
              style({display: 'flex', 'flex-wrap': 'wrap'}).
              tag(this.view$.map(v => {
                // TODO: add a method to Property to bind a view
                var p = v ? prop.clone().copyFrom({view: v}) : prop;
                return p.toE_({}, this.__context__);
              })).
              add(this.units$.map(units => {
                if ( ! units ) return '';
                return this.E().
                  style({position: 'relative', 'align-self': 'center'}).
                  add(units).
                  call(function() {
                    this.el().then((el) => {
                      // TODO: find parent and add extra padding
                      var style = this.__context__.window.getComputedStyle(el);
                      this.style({'margin-left': -8-parseFloat(style.width)});
                    });
                  });
              })).
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
        addClass().
       // start(Row).add('start',data.ID, data.ENABLED, data.IS_EMPLOYEE,'end').end().
        start('h3').add('Title').end().
        start(Columns).
          start(Column).
            add(data.ID, data.ENABLED, data.FIRST_NAME, data.EMAIL).
          end().
          start(Column).
            add(data.CREATED, data.IS_EMPLOYEE, data.LAST_NAME, data.BIRTHDAY).
          end().
        end().
        br().
        start(Tabs).
          start(Tab, {label: 'Address'}).
            add(data.ADDRESS).
            start(Columns).
              start(Column).
                add(data.CITY, data.COUNTRY).
              end().
              start(Column).
                tag(self.PropertyView, {
                  prop: data.POSTAL_CODE,
                  label: this.data.country$.map(c => {
                    return { Canada: 'Postal Code', 'United States': 'Zip Code' }[c];
                  })
                }).
                tag(self.PropertyView, {
                  prop: data.REGION,
                  view$: this.data.country$.map(c => {
                    if ( c === 'Canada' ) return {
                      class: 'foam.u2.view.ChoiceView',
                      choices: [
                        [ 'ON', 'Ontario' ],
                        [ 'PQ', 'Quebec' ],
                        [ 'OT', 'Other' ]
                      ]
                    };
                    return data.REGION.view;
                  }),
                  label: this.data.country$.map(c => {
                    return { Canada: 'Province', 'United States': 'State' }[c];
                  })
                }).
              end().
            end().
          end().
          start(Tab, {label: 'Employee Information'}).
            show(data.isEmployee$).
            add(data.JOB_TITLE, data.SALARY).
          end().
        end().
        start(FoldingSection, {title: 'Employee Information'}).
          show(data.isEmployee$).
          add(data.JOB_TITLE).
          tag(self.PropertyView, {
            prop: data.SALARY,
            units: this.data.country$.map(c => {
              return { Canada: 'CAD$', 'United States': '$' }[c];
            })
          }).
        end();
    }
  ]
});

// Bug: Borders don't pass down Context properly

E('br').write();
E('hr').write();
E('br').write();

foam.CLASS({
  name: 'ControllerModeTester',
  extends: 'foam.u2.Controller',

  properties: [
    {
      class: 'Enum',
      name: 'mode',
      of: 'foam.u2.ControllerMode'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    }
  ],

  methods: [
    function render() {
      this.SUPER();

      this.
        add(this.MODE).
        tag('hr').
        add(this.mode$.map(m => {
          return this.E().startContext({controllerMode: m}).tag(this.view);
        }));
    }
  ]
});

var user = User.create({firstName: 'Kevin', lastName: 'Greer'});

ControllerModeTester.create({
  view: {class: 'CustomUserDetailView', of: User, data: user}
}).write();

//CustomUserDetailView.create({of: User, data: user}).write();

/*
foam.u2.DetailView.create({data: user, showActions: true}).write();

foam.u2.detail.SectionedDetailView.create({data: user, showActions: true}).write();
*/
