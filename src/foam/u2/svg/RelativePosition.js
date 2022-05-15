foam.CLASS({
  package: 'foam.u2.svg',
  name: 'RelativePosition',
  extends: 'foam.u2.svg.Position',

  requires: [
    'foam.u2.svg.Position'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.svg.Position',
      name: 'reference'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.svg.Position',
      name: 'amount',
      factory: function () {
        return this.Position.create({ x: 0, y: 0 });
      }
    },
    {
      name: 'x',
      expression: function (reference$x, amount$x) {
        return reference$x + amount$x;
      }
    },
    {
      name: 'y',
      expression: function (reference$y, amount$y) {
        return reference$y + amount$y;
      }
    }
  ]
});
