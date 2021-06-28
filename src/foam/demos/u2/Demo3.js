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


foam.CLASS({
  name: 'DynamicTest',
  extends: 'foam.u2.Element',

  css: `
    << { color: red; }
    <<tick { background: black; }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'state'
    }
  ],

  methods: [
    function render() {
      this.addClass();
      this.add('before');
      this.start('h1')
        .add('Dynamic Test 1')
        .enableClass(this.myClass('tick'), this.state$)
      .end();
      this.start('h2').add('Dynamic Test 2').end();
      this.add('after');
      this.br();
      this.add('state:', this.state, this.state$);
      this.style({background: 'lightgray'});
      this.tag('hr');
      this.add('end');
      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        this.state = ! this.state;
        this.tick();
      }
    }
  ]
});

var dt = DynamicTest.create().write();
