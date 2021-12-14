/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'foam.demos.designPatterns.decorator.concreteDecorator',
  name: 'Milk',
  extends: 'foam.demos.designPatterns.decorator.concreteDecorator.AddonDecorator',

  methods: [
// TODO: to fix the constructor
//     {
//       name: 'init',
//       type: 'Void',
//       args: [ { type: 'Beverage', name: 'beverage' } ],
//       code: function () {
//         this.SUPER(beverage);
//       }
//     },
    {
      name: 'getDescription',
      type: 'String',
      code: function () {
        return this.beverage.getDescription() + " with milk";
      }
    },
    {
      name: 'cost',
      type: 'Float',
      code: function () {
        return this.beverage.cost() + 1;
      }
    }
    // function init(beverage) {
    //   this.SUPER(beverage);
    //   //super(beverage);
    // },
    // function getDescription() {
    //   return this.beverage.getDescription() + " with milk";
    // },
    // function cost() {
    //   return this.beverage.cost() + 1;
    // }
  ]
});
