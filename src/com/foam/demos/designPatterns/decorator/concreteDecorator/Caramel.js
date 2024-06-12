/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'foam.demos.designPatterns.decorator.concreteDecorator',
  name: 'Caramel',
  extends: 'foam.demos.designPatterns.decorator.concreteDecorator.AddonDecorator',

  methods: [
    // TODO: to fix the constructor
    //     {
    //       name: 'init',
    //       type: 'Void',
    //       args: [ { type: 'Beverage', name: 'beverage' } ],
    //       code: function () {
    //         this.SUPER(beverage); // Or use this.SUPER()
    //       }
    //     },
    {
      name: 'getDescription',
      type: 'String',
      code: function () {
        return this.beverage.getDescription() + " with caramel";
      }
    },
    {
      name: 'cost',
      type: 'Float',
      code: function () {
        return this.beverage.cost() + 2;
      }
    }
    // function init(beverage) {
    //   this.SUPER(beverage);
    // },
    // function getDescription() {
    //   return this.beverage.getDescription() + " with caramel";
    // },
    // function cost() {
    //   return this.beverage.cost() + 2;
    // }
  ]
});
