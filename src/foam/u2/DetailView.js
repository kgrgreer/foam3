/**
 * @license
 * Copyright 2015 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'DetailView',
  extends: 'foam.u2.View',
  mixins: [ 'foam.u2.memento.Memorable' ],

  documentation: 'A generic property-sheet style View for editing an FObject.',

  requires: [
    'foam.core.Property',
    'foam.u2.Tab',
    'foam.u2.Tabs'
  ],

  exports: [
    'currentData as data',
    'currentData as objData'
  ],

  axioms: [
    foam.pattern.Faceted.create()
  ],

  classes: [
    {
      name: 'PropertyBorder',
      extends: 'foam.u2.AbstractPropertyBorder',

      inheritCSS: false,

      properties: [ [ 'nodeName', 'TR' ] ],

      css: `
        ^label {
          vertical-align: top;
          padding-top: 4px;
          white-space: nowrap;
          padding-right: 20px;
        }

        ^view { display: inline; }

        ^errorText { font-size: smaller; }

        ^helper-icon { display: inline; vertical-align: middle; margin-left: 4px; }

        ^helper-icon div { display: inline; }

        ^ .foam-u2-borders-ExpandableBorder-container { padding: 6px; margin-top: 4px; }

        ^ .foam-u2-borders-ExpandableBorder-container h6 { margin: 0; padding-bottom: 0; }

        ^ .foam-u2-borders-ExpandableBorder-container p { margin-top: 4px; margin-bottom: 0; }

        // ^ input { width: 90% }

        ^ input[type!='checkbox'] { width: auto; }
      `,

      methods: [
        function layout(prop, visibilitySlot, modeSlot, labelSlot, viewSlot, colorSlot, errorSlot) {
          var self = this;

          this.
            addClass().
            show(visibilitySlot).
            start('td').addClass(this.myClass('label')).add(labelSlot).end().
            start('td').
            start('span').
              addClass(this.myClass('propHolder')).
              start('span').
                addClass(this.myClass('propHolderInner')).
                add(viewSlot).
              end().
              callIf(prop.help, function() {
                this.start().addClass(self.myClass('helper-icon'))
                  .start('', { tooltip: prop.help.length < 60 ? prop.help : self.LEARN_MORE })
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
            end().
            callIf(prop.help, function() {
              this
                .start(self.ExpandableBorder, { expanded$: self.helpEnabled$, title: self.HELP })
                  .style({ 'flex-basis': '100%', width: '100%' })
                  .start('p').add(prop.help).end()
                .end();
            });
        }
      ]
    }
  ],

  css: `
    ^ {
      border-collapse: collapse;
      width: 100%;
    }

    ^title {
      background: #ddd;
      border: 1px solid rgb(128, 128, 128);
      color: gray;
      font-weight: 500;
      margin-bottom: 10px;
      padding: 6px;
    }
  `,

  properties: [
    {
      name: 'route',
      memorable: true
    },
    {
      name: 'data',
      attribute: true,
      preSet: function(_, data) {
        var of = data && data.cls_;
        if ( of !== this.of ) {
          this.of = of;
        } else {
          this.currentData = data;
        }
        return data;
      },
      factory: function() {
        return this.of && this.of.create(null, this);
      }
    },
    'currentData',
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Boolean',
      name: 'showActions',
      value: true
    },
    {
      name: 'properties',
      // TODO: Make an FObjectArray when it validates properly
      preSet: function(_, ps) {
        foam.assert(ps, 'Properties required.');
        for ( var i = 0 ; i < ps.length ; i++ ) {
          if ( ! foam.core.Property.isInstance(ps[i]) ) {
            var p = this.of.getAxiomByName(ps[i]);
            if ( ! foam.core.Property.isInstance(p) ) {
              foam.assert(
                false,
                `Non-Property in 'properties' list:`,
                ps);
            } else {
              ps[i] = p;
            }
          }
        }
        return ps;
      },
      expression: function(of) {
        if ( ! of ) return [];
        var ret = this.of.getAxiomsByClass(foam.core.Property).
          // TODO: this is a temporary fix, but DisplayMode.HIDDEN should be included and could be switched
          filter(function(p) {
            return ! ( p.hidden || p.visibility === foam.u2.DisplayMode.HIDDEN );
          });
        ret.sort(foam.core.Property.ORDER.compare);
        return ret;
      }
    },
    {
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'
    },
    {
      name: 'actions',
      expression: function(of) {
        if ( ! of ) return [];
        return this.of.getAxiomsByClass(foam.core.Action);
      }
    },
    {
      name: 'title',
      attribute: true,
      expression: function(of) {
        return this.of ? this.of.model_.label : '';
      }
    },
    ['nodeName', 'DIV']
  ],

  methods: [
    function render() {
      var self = this;
      this.dynamic(function(route) {
        self.removeAllChildren(); // TODO: not needed in U3

        if ( route ) {
          self.currentData = self.data;
          var axiom = self.of.getAxiomByName(route);
          this.br().add(axiom.__);
        } else {
          self.renderDetailView();
        }
      });
    },

    function renderDetailView() {
      // The next two lines are so that FObjectView uses this kind of DetailView
      // for nested objects.
      this.__subContext__.register(this.cls_, 'foam.u2.detail.SectionedDetailView');
      this.__subContext__.register(this.cls_, 'foam.u2.detail.VerticalDetailView');

      var self    = this;
      var hasTabs = false;

      this.add(this.dynamic(function(of, properties, actions) {
        if ( ! of ) return '';

        // Binds view to currentData instead of data because there
        // is a delay from when data is updated until when the UI
        // is rebuilt if the data's class changes. Binding directly
        // to data causes views and actions from the old class to get
        // bound to data of a new class, which causes problems.
        self.currentData = self.data;

        var tabs;

        return this.start('table').
          attrs({'cellpadding': 2}).
          addClass(self.myClass()).
          callIf(self.title, function() {
            this.start('tr').start('td').attrs({colspan: 2}).addClass(self.myClass('title')).add(self.title$);
          }).
          forEach(properties, function(p) {
            var config = self.config && self.config[p.name];
            var expr   = foam.mlang.Expressions.create();

            if ( config ) {
              p = p.clone();
              for ( var key in config ) {
                if ( config.hasOwnProperty(key) ) {
                  p[key] = config[key];
                }
              }
            }

            if (
              p.cls_ == foam.dao.OneToManyRelationshipProperty ||
              p.cls_ == foam.dao.ManyToManyRelationshipProperty
            ) {
              if ( ! hasTabs ) {
                hasTabs = true;
                tabs = foam.u2.Tabs.create({}, self);
              }
              var label = p.label;
              let tab = self.Tab.create({ label: label });
              var dao = p.cls_ == foam.dao.ManyToManyRelationshipProperty
                ? p.get(self.data).getDAO()
                : p.get(self.data);
              dao.select(expr.COUNT()).then(function(c) {
                tab.label = label + ' (' + c.value + ')';
              });

              p = p.clone();
              p.label = '';
              tab.tag(self.PropertyBorder, { prop: p });
              tabs.add(tab);
            } else {
              this.tag(self.PropertyBorder, { prop: p, nodeName: 'TR' });
            }
          }). // forEach
          callIf(hasTabs, function() {
            this.start('tr').start('td').setAttribute('colspan', '2').add(tabs).end().end();
          }).
        end().
        callIf(this.showActions && this.actions.length, function() {
          this.start('div').addClass(self.myClass('toolbar')).add(self.actions).end();
        });
      })); // add
    }
  ]
});
