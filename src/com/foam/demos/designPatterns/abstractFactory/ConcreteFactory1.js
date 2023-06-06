/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'foam.demos.designPatterns.abstractFactory',
  name: 'ConcreteFactory1',
  extends: 'foam.demos.designPatterns.abstractFactory.Factory',

  requires: [
    'foam.demos.designPatterns.abstractFactory.product.ConcreteProductA1',
    'foam.demos.designPatterns.abstractFactory.product.ConcreteProductB1',
    'foam.demos.designPatterns.abstractFactory.product.ProductA',
    'foam.demos.designPatterns.abstractFactory.product.ProductB'
  ],
  
  properties: [
    {//TODO add private
      of: 'foam.demos.designPatterns.abstractFactory.product.ProductA',
      name: 'ProductA',
    },
    {//TODO add private
      of: 'foam.demos.designPatterns.abstractFactory.product.ProductB',
      name: 'ProductB',
    }
  ],
    methods: [
      function init() {
        this.SUPER();
        this.productA = this.ConcreteProductA1.create({});
        this.productB = this.ConcreteProductB1.create({});
      },
      function getProductA() {
        return this.productA;
      },
      function getProductB() {
        return this.productB;
      }
  ]
});