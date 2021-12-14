/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.designPatterns.abstractFactory',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.demos.designPatterns.abstractFactory.ConcreteFactory1',
    'foam.demos.designPatterns.abstractFactory.ConcreteFactory2',
    'foam.demos.designPatterns.abstractFactory.ConcreteFactory3',

    'foam.demos.designPatterns.abstractFactory.product.ConcreteProductA1',
    'foam.demos.designPatterns.abstractFactory.product.ConcreteProductA2',
    'foam.demos.designPatterns.abstractFactory.product.ConcreteProductA3',

    'foam.demos.designPatterns.abstractFactory.product.ConcreteProductB1',
    'foam.demos.designPatterns.abstractFactory.product.ConcreteProductB2',
    'foam.demos.designPatterns.abstractFactory.product.ConcreteProductB3',

    'foam.demos.designPatterns.abstractFactory.product.ProductA',
    'foam.demos.designPatterns.abstractFactory.product.ProductB',
    'foam.demos.designPatterns.abstractFactory.Factory',
  ],

  methods: [
    function init() {

      var prod1 = this.ConcreteFactory1.create({});
      this.start('h3').add('Product ').add(prod1.getProductA()+" "+ prod1.getProductB()).end();  

      var prod2 = this.ConcreteFactory2.create({});
      this.start('h3').add('Product ').add(prod2.getProductA()+" "+ prod2.getProductB()).end();  

   /*   
    Factory prod1 = new ConcreteFactory1();
    System.out.println(prod1.getProductA().getClass());
    System.out.println(prod1.getProductB().getClass());
    
    Factory prod2 = new ConcreteFactory2();
    System.out.println(prod2.getProductA().getClass());
    System.out.println(prod2.getProductB().getClass());
    */
    }
  ]
});
