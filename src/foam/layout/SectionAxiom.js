/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.layout',
  name: 'SectionAxiom',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'title',
      expression: function(name) {
        if ( name === '_defaultSection' ) return '';
        return foam.String.labelize(name);
      }
    },
    {
      name: 'subTitle'
    },
    {
      name: 'navTitle'
    },
    {
      name: 'properties'
    },
    {
      name: 'help'
    },
    {
      class: 'Int',
      name: 'order',
      value: Number.MAX_SAFE_INTEGER
    },
    {
      class: 'Boolean',
      name: 'permissionRequired'
    },
    {
      name: 'gridColumns'
    },
    {
      class: 'Function',
      name: 'isAvailable',
      value: function() { return true; }
    },
    {
      class: 'String',
      name: 'section',
      getter: function() { return this.section_ ; },
      setter: function(m) { this.section_ = m; }
    },
    {
      class: 'Simple',
      name: 'section_'
    }
  ],

  methods: [
    function createIsAvailableFor(data$, controllerMode$) {
      var self = this;
      var slot = foam.core.ProxyExpressionSlot.create({
        obj$: data$,
        code: this.isAvailable
      });
      var availabilitySlots = [slot];

      // Conditionally, add permission check, (permSlot)
      if ( this.permissionRequired ) {
        var permSlot = foam.core.SimpleSlot.create({value: false});
        var update = function() {
          var data = data$.get();
          if ( data && data.__subContext__.auth ) {
            data.__subContext__.auth.check(null,
              `${data.cls_.id.toLowerCase()}.section.${self.name}`).then((hasAuth) => {
                permSlot.set(hasAuth);
              });
          }
        };
        update();
        data$.sub(update);
        availabilitySlots.push(permSlot);
      }

      // Add check for at least one visible property (propVisSlot)
      var data = data$.get();
 
      let props;
      if ( this.hasOwnProperty('properties') ) {
        props = this.properties.map(p => {
          if ( foam.String.isInstance(p) ) return data.cls_.getAxiomByName(p);
          // TODO: allow string only path props
          if ( p.name ) {
            if ( p.name.indexOf('.') != -1 ) {
              let p2 = Object.assign({}, p);
              delete p2.name;
              return foam.layout.PathPropertyHolder.create({ name: p.name.split('.').pop(), value: p.name, config: p2 });
            }
            return data.cls_.getAxiomByName(p.name).clone().copyFrom(p);
          }
        });
      } else {
        props = data.cls_.getAxiomsByClass(foam.core.Property)
          .filter(p => p.section === this.name);
      }
      var propVisSlot = foam.core.ArraySlot.create({
        slots: props.map(
          p => p.createVisibilityFor(data$,
            controllerMode$ ||
            data.__subContext__.controllerMode$ ||
            (data.__subContext__.ctrl && data.__subContext__.ctrl.controllerMode$) ||
            foam.core.ConstantSlot.create({value: foam.u2.ControllerMode.CREATE})
          )
        )
      }).map(arr => arr.some(m => {
        return m != foam.u2.DisplayMode.HIDDEN;
      }));

      // add check for at least one available action as well (actionAvailSlot)
      var actions = data.cls_.getAxiomsByClass(foam.core.Action)
        .filter(a => a.section === this.name);

      var actionAvailSlot = foam.core.ArraySlot.create({
        slots: actions.map(
          a => a.createIsAvailable$(data.__subContext__, data)
        )
      }).map(arr => arr.some(isAvailable => {
        return isAvailable;
      }));

      var atLeastOnePropertyOrActionAvailableSlot = foam.core.ArraySlot.create({
        slots: [
          propVisSlot,
          actionAvailSlot
        ]
      }).map(arr => arr.some(isVisibleOrAvailable => {
        return isVisibleOrAvailable;
      }));

      availabilitySlots.push(atLeastOnePropertyOrActionAvailableSlot);

      var simpleSlot = foam.core.SimpleSlot.create();
      var arrSlot = foam.core.ArraySlot.create({slots: availabilitySlots}).map(arr => {
        var ret =  arr.every(b => b);
        if ( ret != simpleSlot.get() ) simpleSlot.set(ret); 
        return ret;
      });
      arrSlot.get();
      arrSlot.sub(function(){ arrSlot.get(); });
      return simpleSlot;
    },

    function installInClass(cls) {
      cls['SECTION_'+foam.String.constantize(this.name)] = this;
    }
  ]
});


foam.CLASS({
  package: 'foam.layout',
  name: 'PropertySectionRefine',
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'String',
      name: 'section',
      value: '_defaultSection'
    }
  ]
});


foam.CLASS({
  package: 'foam.layout',
  name: 'ActionSectionRefine',
  refines: 'foam.core.Action',

  properties: [
    {
      class: 'String',
      name: 'section',
      value: '_defaultSection'
    }
  ]
});

foam.CLASS({
  package: 'foam.layout',
  name: 'ModelSectionRefine',
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      of: 'foam.layout.SectionAxiom',
      name: 'sections'
    }
  ]
});
