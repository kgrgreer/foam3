foam.u2.Element.create().add('children').write(document);
foam.u2.Element.create().write(document).add('children');
foam.u2.Element.create({nodeName: 'b'}).add('children').write(document);
foam.u2.Element.create({nodeName: 'b'}).write(document).add('children');
foam.u2.Element.create().style({color: 'red'}).add('children').write(document);
foam.u2.Element.create().write(document).style({color: 'red'}).add('children');
foam.u2.Element.create().on('click', () => console.log('clicked')).add('clickme').write(document);
foam.u2.Element.create().write(document).on('click', () => console.log('clicked')).add('clickme');

foam.CLASS({
  name: 'Test',
  extends: 'foam.u2.Element',

  properties: [ [ 'nodeName', 'i' ] ],

  methods: [
    function render() {
      this.add('child1', 'child2').br().start('b').add('bold').end().br();
    }
  ]
});

var t = Test.create().write(document);
t.add('more children');
