/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.layout',
  name: 'PathPropertyHolder',
  extends: 'foam.core.Property',
  documentation: `A property for holding paths to sub-properties in FObjectProperties. 
  Used by Section and SectionView to render properties of FObjectProperties`,

  requires: ['foam.core.ProxySlot'],
  properties: [
    {
      name: 'value',
      postSet: function(o,n) {
        this.path = n;
        this.parent = n.split('.').slice(0, -1).join('.');
      }
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'path'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'parent'
    },
    {
      name: 'slotPath',
      expression: function(value) {
        return value.replace('.', '$');
      }
    },
    {
      name: 'parentSlotPath',
      expression: function(parent) {
        return parent.toString().replace('.', '$');
      }
    },
    'config'
  ],
  methods: [

    function createVisibilityFor(data$, controllerMode$) {
      let self = this;
      return this.ProxySlot.create({
        // IMPORTANT: Delegate expects a slot so this slot returning a slot is correct behaviour
        delegate$: data$.map(data => {
          let propData$ = data$.dot(self.parentSlotPath);
          let p = self.parent$get(data)?.[foam.String.constantize(self.name)];
          return p ? p.createVisibilityFor(propData$, controllerMode$) : foam.core.ConstantSlot.create({ value: foam.u2.DisplayMode.HIDDEN });
        })
      });
    },
    // Override default behaviour so when this prop is added to the DOM it displays the real prop instead
    function toPropertyView(args, X) {
      let data = args?.data || args?.data$.get() || X.data$.get();
      let realProp = this.parent$get(data)?.[foam.String.constantize(this.name)];
      if ( ! realProp )  {
        console.error(`Couldn't find path at provided path ${this.value} for currrent data: ${data}`, data, this.parent$get(data)); 
        return null;
      }
      realProp = realProp.clone().copyFrom(this.config);
      this.gridColumns$ = realProp.gridColumns$;
      // Override any data/data$ provided with appropriate replacements for real propertys
      let data$ = args?.data?.slot(this.parentSlotPath) || (args?.data$ || X.data$).dot(this.parentSlotPath);
      X = X.createSubContext({ data: data$ })
      return realProp.createElFromSpec_({ class: 'foam.u2.PropertyBorder', prop: realProp }, {...args, data$: data$}, X);
    }
  ]
});