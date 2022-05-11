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
      5. Display error messages based on teh Proeprty's validateObj:
      6. Add tooltip from Property's help:
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

      var errorSlot = prop.validateObj && prop.validationTextVisible ?
        data.slot(prop.validateObj) :
        foam.core.ConstantSlot.create({ value: null });

      var modeSlot = this.prop.createVisibilityFor(
        this.__context__.data$,
        this.controllerMode$);

      // Boolean version of modeSlot for use with show()
      var visibilitySlot = modeSlot.map(m => m != foam.u2.DisplayMode.HIDDEN)

      this.
        addClass().
        show(visibilitySlot).
        style({'padding-top': '8px'}).

        start('div').style({'padding-bottom': '2px'}).add(this.label).end().

        start('div').
          style({display: 'flex', 'flex-wrap': 'wrap'}).
          tag(this.view$.map(v => {
            // TODO: add a method to Property to bind a view
            var p = v ? prop.clone().copyFrom({view: v}) : prop;
            return p.toE_({mode$: modeSlot}, this.__context__);
          })).
          add(this.units$.map(units => {
            if ( ! units ) return '';
            return this.E().
              style({'padding-left': '4px', 'align-self': 'center'}).
              add(' ' + units).
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
});
