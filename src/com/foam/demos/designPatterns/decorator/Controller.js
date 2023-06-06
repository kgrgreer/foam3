/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.designPatterns.decorator',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.demos.designPatterns.decorator.concreteDecorator.Milk',
    'foam.demos.designPatterns.decorator.concreteDecorator.Caramel',
    'foam.demos.designPatterns.decorator.concreteComponent.Espress',
    'foam.demos.designPatterns.decorator.concreteComponent.Decaf'
  ],

  methods: [

    function init() {

      var b = this.Caramel.create({beverage : this.Espress.create({})});
      this.start('h3').add('Caffee ').add(b.getDescription()+" "+ b.cost()).end();

      var b1 = this.Caramel.create({beverage : this.Milk.create({beverage : this.Espress.create({})}) });//
      this.start('h3').add('Caffee ').add(b1.getDescription()+" "+ b1.cost()).end();

      var b2 = this.Caramel.create({beverage : this.Milk.create({beverage : this.Decaf.create({})}) });//
      this.start('h3').add('Caffee ').add(b2.getDescription()+" "+ b2.cost()).end();

      var b3 = this.Milk.create({beverage : this.Espress.create({})});
      this.start('h3').add('Caffee ').add(b3.getDescription()+" "+ b3.cost()).end();

      /*
      Beverage b = new Caramel(new Espress());
      System.out.println(b.getDescription()+" "+ b.cost());

      Beverage b1 = new Caramel(new Milk( new Espress()));
      System.out.println(b1.getDescription()+" "+ b1.cost());

      Beverage b2 = new Caramel(new Milk( new Decaf()));
      System.out.println(b2.getDescription()+" "+ b2.cost());
      */
    }
  ]
});
