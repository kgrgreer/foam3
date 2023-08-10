/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'SectionView',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.ArraySlot',
    'foam.core.ConstantSlot',
    'foam.core.ProxySlot',
    'foam.core.SimpleSlot',
    'foam.layout.Section',
    'foam.u2.PropertyBorder',
    'foam.u2.DisplayMode',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit',
    'foam.u2.layout.Rows'
  ],

  css: `

    ^section-title {
      padding-bottom: 16px;
    }

    .subtitle {
      color: $grey500;
      margin-bottom: 16px;
    }

    ^actionDiv {
      justify-content: end;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'sectionName'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.layout.Section',
      name: 'section',
      expression: function(data, sectionName) {
        if ( ! data ) return null;
        var of = data.cls_;
        var a = of.getAxiomByName(sectionName);
        return this.Section.create().fromSectionAxiom(a, of);
      }
    },
    {
      class: 'Boolean',
      name: 'showTitle',
      value: true
    },
    {
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'
    },
    {
      class: 'Function',
      name: 'evaluateMessage',
      documentation: `Evaluates model messages without executing potentially harmful values`,
      factory: function() {
        var obj = this.data.clone();
        return (msg) => msg.replace(/\${(.*?)}/g, (x, str) => {
          return this.getNestedPropValue(obj, str);
        });
      }
    },
    {
      class: 'Function',
      name: 'getNestedPropValue',
      documentation: `
        Finds the value of an object in reference to the property path provided
        ex. 'obj.innerobj.name' will return the value of 'name' belonging to 'innerobj'.
      `,
      factory: function() {
        return (obj, path) => {
          if ( ! path ) return obj;
          const props = path.split('.');
          return this.getNestedPropValue(obj[props.shift()], props.join('.'))
        }
      }
    },
    {
      class: 'Boolean',
      name: 'loadLatch',
      factory: function() {
        return this.selected;
      }
    },
    {
      class: 'Boolean',
      name: 'selected',
      postSet: function() {
        if ( this.selected )
          this.loadLatch = this.selected;
      },
      value: true
    }
  ],

  methods: [
    function render() {
      var self = this;
      self.SUPER();

      if ( this.section )
        this.shown$ = this.section.createIsAvailableFor(self.data$, self.__subContext__.controllerMode$);

      self
        .addClass(self.myClass())
        .callIf(self.section, function() {
          self.addClass(self.myClass(self.section.name))
        })
        .add(self.slot(function(section, showTitle, section$title, section$subTitle, shown) {
          if ( ! section || ! shown ) return;
          return self.Rows.create()
            .callIf(showTitle && section$title, function() {
              if ( foam.Function.isInstance(self.section.title) ) {
                const slot$ = foam.core.ExpressionSlot.create({
                  args: [ self.evaluateMessage$, self.data$ ],
                  obj$: self.data$,
                  code: section.title
                });
                if ( slot$.value ) {
                  this.start().add(slot$.value.toUpperCase()).addClass('h500', self.myClass('section-title')).end();
                }
              } else {
                this.start('h5').add(section.title.toUpperCase()).addClass('h500', self.myClass('section-title')).end();
              }
            })
            .callIf(section$subTitle, function() {
              if ( foam.Function.isInstance(self.section.subTitle) ) {
                const slot$ = foam.core.ExpressionSlot.create({
                  args: [ self.evaluateMessage$, self.data$ ],
                  obj$: self.data$,
                  code: section.subTitle
                });
                if ( slot$.value ) {
                  this.start().addClass('p', 'subtitle').add(slot$.value).end();
                }
              } else {
                this.start().addClass('p', 'subtitle').add(section.subTitle).end();
              }
            })
            .add(this.slot(function(loadLatch) {
              var view = this.E().start(self.Grid).style({ 'grid-gap': '16px 12px' });

              if ( loadLatch ) {
                view.forEach(section.properties, function(p, index) {
                  var config = self.config && self.config[p.name];

                  if ( config ) {
                    p = p.clone();
                    for ( var key in config ) {
                      if ( config.hasOwnProperty(key) ) {
                        p[key] = config[key];
                      }
                    }
                  }
                  var shown$ = p.createVisibilityFor(self.data$, self.controllerMode$).map(mode => mode != self.DisplayMode.HIDDEN);
                  this.start(self.GUnit, { columns$: p.gridColumns$ })
                    .show(shown$)
                    .add(shown$.map(shown => {
                      return shown ? p.toPropertyView({ data$: self.data$ }, self.__subContext__) :
                      self.E();
                    }))
                  .end();
                });
              }

              return view;
            }))
            .start(self.Cols)
              .addClass(self.myClass('actionDiv'))
              .style({
                'margin-top': section.actions.length ? '16px' : 'initial'
              })
              .forEach(section.actions, function(a) {
                this.add(a);
              })
            .end();
        }));
    }
  ]
});
