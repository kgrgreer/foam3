/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'foam.demos.designPatterns.decorator.concreteComponent',
  name: 'Espress',
  extends: 'foam.demos.designPatterns.decorator.Beverage',

  methods: [
    {
      name: 'getDescription',
      type: 'String',
      code: function () {
        return "Espress";
      }
    },
    {
      name: 'cost',
      type: 'Float',
      code: function () {
        return 1;
      }
    }
    // function getDescription() {
    //   return "Espress";
    // },
    // function cost() {
    //   return 1;
    // }
  ]
});
