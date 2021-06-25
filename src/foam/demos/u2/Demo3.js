foam.u2.Element.create().add('children').write();
foam.u2.Element.create().write().add('children');
foam.u2.Element.create({nodeName: 'b'}).add('children').write();
foam.u2.Element.create({nodeName: 'b'}).write().add('children');
foam.u2.Element.create().style({color: 'red'}).add('children').write();
foam.u2.Element.create().write().style({color: 'red'}).add('children');
foam.u2.Element.create().on('click', () => console.log('clicked')).add('clickme').write();
foam.u2.Element.create().write().on('click', () => console.log('clicked')).add('clickme');

foam.CLASS({
  name: 'Test',
  extends: 'foam.u2.Element',

  properties: [ [ 'nodeName', 'i' ] ],

  methods: [
    function render() {
      this.add('child1', 'child2').br().start('b').add('bold').end().br().entity('lt').add('>').add('end');
    }
  ]
});

var t = Test.create().write();
t.add('more children');

var v1 = foam.u2.TextField.create({data: 'data'}).write();
var v2 = foam.u2.TextField.create({data: 'data'}).write();
v1.data$ = v2.data$;

var v1 = foam.u2.TextField.create({data: 'data2', onKey: true}).write();
var v2 = foam.u2.TextField.create({data: 'data2', onKey: true}).write();
v1.data$ = v2.data$;
