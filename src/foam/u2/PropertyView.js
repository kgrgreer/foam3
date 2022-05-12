/**
  * @license
  * Copyright 2022 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

 foam.CLASS({
  package: 'foam.u2',
  name: 'PropertyView',
  extends: 'foam.u2.Element', // isn't actually a View (no data), more like a border or wrapper

  documentation: `
    Wraps a Property's underlying View with extra functionality to:
      1. Display a Label from Property's label:
      2. Display Units, if set in Property's units:
      3. Show/Hide the View based on the Property's visibility:
      4. Change the underlying View's Visibility to RO/RW/etc based on visibility:
      5. Display error messages based on teh Property's validateObj: & validationPredicates:
      6. Add tooltip from Property's help

      TODO: popup for more help
  `,

  css: `
    ^ .error input { border-color: red !important; }
    ^ .error input:focus { border-color: red !important; }
    ^label { }
  `,

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
    function render() {
      var prop = this.prop;

      if ( prop.help ) this.tooltip = prop.help;

      // Needs to be called after tooltip is set, which seems like a bug. KGR
      this.SUPER();

      var data = this.__context__.data;

      var errorSlot = prop.validateObj /*&& prop.validationTextVisible*/ ?
        data.slot(prop.validateObj) :
        foam.core.ConstantSlot.create({ value: null });

      var modeSlot = this.prop.createVisibilityFor(
        this.__context__.data$,
        this.controllerMode$);

      // Boolean version of modeSlot for use with show()
      var visibilitySlot = modeSlot.map(m => m != foam.u2.DisplayMode.HIDDEN)

      var colorSlot = this.__context__.data$.dot(prop.name).map(d => {
        return d ? 'red' : '#333';
      });

      this.
        addClass().
        show(visibilitySlot).
        style({'padding-top': '2px'}).

        start('div').addClass(this.myClass('label')).style({'padding-bottom': '2px'}).add(this.label).end().

        start('div').
          enableClass('error', errorSlot).
          style({display: 'flex', 'flex-wrap': 'wrap'}).
          tag(this.view$.map(v => {
            // TODO: add a method to Property to bind a view
            var p = v ? prop.clone().copyFrom({view: v}) : prop;

            // Add the Property's View
            return p.toE_({mode$: modeSlot}, this.__context__);
          })).
          add(this.units$.map(units => {
            if ( ! units ) return '';
            return this.E().
              style({'padding-left': '4px', 'align-self': 'center'}).
              add(' ' + units).
              call(function() {
                return;
                this.el().then((el) => {
                  // TODO: find parent and add extra padding
                  var style = this.__context__.window.getComputedStyle(el);
                  this.style({'margin-left': -8-parseFloat(style.width)});
                });
              });
          })).
          start('div').
            style({
              'flex-basis': '100%',
              xxxheight: '20px',
              'padding-top': '6px',
              'font-size': 'smaller',
              color: colorSlot
            }).
            start('span').
              show(errorSlot.and(modeSlot.map(m => m == foam.u2.DisplayMode.RW))).
              start('img').attrs({src: 'http://localhost:8080/images/inline-error-icon.svg', width: 16, height: 16}).end().
              start('span').style({'vertical-align': 'top'}).add(' ', errorSlot).end().
            end().
          end().
        end();
    }
  ]
});
