/**
  * @license
  * Copyright 2022 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

foam.CLASS({
  package: 'foam.u2',
  name: 'PropertyBorder',
  extends: 'foam.u2.Element',

  documentation: `
    Wraps a Property's underlying View with extra functionality to:
      1. Display a Label from Property's label:
      2. Display Units, if set in Property's units:
      3. Show/Hide the View based on the Property's visibility:
      4. Change the underlying View's Visibility to RO/RW/etc based on visibility:
      5. Display error messages based on teh Property's validateObj: & validationPredicates:
      6. Add Property's help
  `,

  requires: [
    'foam.core.ArraySlot',
    'foam.core.ConstantSlot',
    'foam.u2.borders.ExpandableBorder',
    'foam.u2.DisplayMode',
    'foam.u2.tag.CircleIndicator'
  ],

  imports: [
    'theme?',
    'data'
  ],

  exports: [ 'data as objData' ],

  messages: [
    { name: 'HELP',       message: 'Help' },
    { name: 'LEARN_MORE', message: 'Click to learn more' }
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 0.4rem;
      width: 100%;
    }
    ^ .error input, ^ .error input:focus {
      border-color: $destructive400!important;
    }
    ^colorText {
      color: $destructive400;
    }
    ^label {
      display: contents;
      line-height: 1;
      min-height: 1em;
      width: 100%;
      color: $grey600;
    }
    ^errorText {
      display: flex;
      align-items: center;
      /*
        Have to use this style here since nanos uses CSS resets to
        set 1 rem = 10px instead of the default 16px
        May cause weird styling outside nanos
      */
      min-height: 1.25em;
      justify-content: flex-start;
      gap: 0.2rem;
    }
    ^errorText svg {
      width: 1rem;
      height: 1rem;
    }
    ^propHolder {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 0.2rem
    }
    ^propHolder > :first-child{
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 0.4rem;
      width: 100%;
    }
  `,

  properties: [
    'prop',
    {
      class: 'Map',
      name: 'viewArgs',
      documentation: `Map prop that gets passed to the prop's view`
    },
    {
      class: 'Map',
      name: 'config',
      documentation: `
        Map of propertyProperty: value for configuring properties
        values include 'label', 'units', and 'view'.
        WARNING: Config accepts slots as key value pairs however config's slot does not update the prop. Eg:
          VALID: config: { label$: someLabelSlot$ }; --> Will update prop label
          INVALID: config$: someLabelSlot$.map(v => { return {label: v} }) --> Will not update prop label
      `
    },
    ['helpEnabled', false]
  ],

  methods: [
    function render() {
      var self = this;
      this.prop = this.prop.clone().copyFrom(this.config);
      var prop = this.prop;

      this.SUPER();

      if ( this.__context__.controllerMode$ )
        this.controllerMode$.follow(this.__context__.controllerMode$);

      var data = this.data;

      // TODO: Add simplified "required: true" UI
      // TODO: Required checks on props are ignored if validateObj returns undefined. Bug? - Sarthak
      /* Future Version:
      var errorSlot = prop.validators && prop.validationTextVisible ?
        foam.core.Validation.orValidators(data, prop.validators) :
        this.ConstantSlot.create({ value: null });
        */

        var errorSlot = prop.validateObj && prop.validationTextVisible ?
          data.slot(prop.validateObj) :
          this.ConstantSlot.create({ value: null });

      var modeSlot = this.prop.createVisibilityFor(
        this.data$,
        this.controllerMode$);

      // Boolean version of modeSlot for use with show()
      var visibilitySlot = modeSlot.map(m => m != foam.u2.DisplayMode.HIDDEN)

      var colorSlot = this.data$.dot(prop.name).map(v => !! v);
      this.
        addClass().
        show(visibilitySlot).
        add(this.slot(function(prop$reserveLabelSpace, prop$label){
          let el = this.E().addClass(this.myClass('label'), this.myClass('label' + '-' + prop.name), 'p-light');
          return prop$label ?
            el.call(prop.labelFormatter, [data, prop]) :
            ( prop$reserveLabelSpace ? el : this.E().style({ display: 'contents' }) )
        })).
        start().
          addClass(this.myClass('propHolder')).
          start().
            add(prop.view$.map(v => {
              // Add the Property's View
              return this.E().add(prop.toE({
                ...self.viewArgs,
                mode$: modeSlot
              }, this.__subContext__ ))
                .style({ 'flex-grow': 1,'max-width': '100%' })
                .enableClass('error', errorSlot.and(colorSlot));
            })).
            add(prop.units$).
          end().
          callIf(prop.help, function() {
            this.start().addClass(self.myClass('helper-icon'))
              .start('', { tooltip: self.LEARN_MORE })
                .start(self.CircleIndicator, {
                  icon: self.theme ? self.theme.glyphs.helpIcon.getDataUrl({ fill: self.theme.black }) : '/images/question-icon.svg',
                  size: 20
                })
                  .on('click', () => { self.helpEnabled = ! self.helpEnabled; })
                .end()
              .end()
            .end();
          }).
        end().
        start().
          /**
           * ERROR BEHAVIOUR:
           * - data == nullish, error == true: Show error in default text color, hide icon
           * - data == ! null, error == true: Show error and icon in destructive, highlight field border
           * Allows for errors to act as suggestions until the user enters a value
           * Potential improvement area: this approach makes it slightly harder to understand why
           * submit action may be unavilable for long/tabbed  forms
           */
          addClass('p-legal-light', this.myClass('errorText')).
          enableClass(this.myClass('colorText'), colorSlot).
           show(errorSlot.and(modeSlot.map(m => m == foam.u2.DisplayMode.RW))).
          // Using the line below we can reserve error text space instead of shifting layouts
          // show(modeSlot.map(m => m == foam.u2.DisplayMode.RW)).
          start({
            class: 'foam.u2.tag.Image',
            data: '/images/inline-error-icon.svg',
            embedSVG: true
          }).show(errorSlot.and(colorSlot)).end().
          add(' ', errorSlot).
        end()
        .callIf(prop.help, function() {
          this
            .start(self.ExpandableBorder, { expanded$: self.helpEnabled$, title: self.HELP })
              .style({ 'flex-basis': '100%', width: '100%' })
              .start('p').add(prop.help).end()
            .end();
        });
    }
  ]
});
