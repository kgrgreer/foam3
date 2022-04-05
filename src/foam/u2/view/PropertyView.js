/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
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
});
