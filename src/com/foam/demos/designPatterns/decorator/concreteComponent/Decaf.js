/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'foam.demos.designPatterns.decorator.concreteComponent',
  name: 'Decaf',
  extends: 'foam.demos.designPatterns.decorator.Beverage',

  methods: [
    {
      name: 'getDescription',
      type: 'String',
      code: function () {
        return "Decaf";
      }
    },
    {
      name: 'cost',
      type: 'Float',
      code: function () {
        return 2;
      }
    }
    // function getDescription() {
    //   return "Decaf";
    // },
    // function cost() {
    //   return 2;
    // }
  ]
});
