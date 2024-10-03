/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.comics.v3',
  name: 'ComicsAction',
  extends: 'foam.core.Action',
  documentation: `
    Creates a distinction for actions that are used by comics. Can be used to override default
    CRUD behaviour. 
    Any action property not overriden explicitly will be copied over from the defaul implementation.
    Any Comics actions with the following names will replace default behaviour in comics v3:
    1. create
    2. edit
    3. delete
    4. copy
  `,
  properties: [
    {
      name: 'code',
      required: false
    },
    {
      class: 'Function',
      generateJava: false,
      name: 'internalIsEnabled'
    },
    {
      class: 'Function',
      generateJava: false,
      name: 'internalIsAvailable'
    }
  ],
  methods: [
    function createIsEnabled$(x, data) {
      var running      = this.getRunning$(data);
      var internalSlot = this.createSlotFor_(x, data, this.internalIsEnabled, 'enabled');
      var slot         = data.data ? this.createSlotFor_(x, data.data, this.isEnabled, 'enabled') :
                         foam.core.ConstantSlot.create({ value: false });
      return foam.core.ExpressionSlot.create({
        args: [
          running,
          internalSlot,
          slot
        ],
        code: function(a, b, c) {
          return (! a) && b && c;
        }
      });
    },

    function createIsAvailable$(x, data) {
      var internalSlot = this.createSlotFor_(x, data, this.internalIsAvailable, 'available');
      let slot         = data.data ? this.createSlotFor_(x, data.data, this.isAvailable, 'available') :
                         foam.core.ConstantSlot.create({ value: false });
      return foam.core.ExpressionSlot.create({
        args: [
          internalSlot,
          slot
        ],
        code: function(a, b) {
          return a && b;
        }
      });
    },

    function checkIsEnabledIsAvailable(data) {
      if ( ( this.internalIsAvailable && ! foam.Function.withArgs(this.internalIsAvailable, data) ) ||
           ( this.isAvailable   && ! foam.Function.withArgs(this.isAvailable, data.data) ) ||
           ( this.internalIsEnabled   && ! foam.Function.withArgs(this.internalIsEnabled, data) ) ||
           ( this.isEnabled   && ! foam.Function.withArgs(this.isEnabled, data.data) ) )
      return true;
    },

    function toE(args, X) {
      var view = foam.u2.ViewSpec.createView(this.view, {
        ...(args || {}),
        action: this
      }, this, X);

      if ( X.data$ && ! ( args && ( args.data || args.data$ ) ) ) {
        view.data$ = X.data$;
      }

      return view;
    }
  ]
});
