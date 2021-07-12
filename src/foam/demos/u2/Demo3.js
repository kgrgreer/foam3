foam.CLASS({
  name: 'SampleData',
  properties: [
    'id', 'name', 'value'
  ],
  methods: [
    function toSummary() { return this.id + ' ' + this.value; }
  ]
});

var dao = foam.dao.EasyDAO.create({
  of: SampleData,
  daoType: 'MDAO',
  testData: [
    { id: 'key1', name: 'John',  value: 'value1' },
    { id: 'key2', name: 'John',  value: 'value2' },
    { id: 'key3', name: 'Kevin', value: 'value3' },
    { id: 'key4', name: 'Kevin', value: 'value4' },
    { id: 'key5', name: 'Larry', value: 'value5' },
    { id: 'key6', name: 'Linda', value: 'value6' }
  ]
});



// This works, but doesn't refresh if the DAO updates
foam.u2.Element.create().write().start('ol').call(function() {
  dao.select(d => {
    this.start('li').add(d.id, ' ', d.name, ' ', d.value).end();
  });
});

foam.u2.Element.create().write().start('ol')
  .start('li').add('first').end()
  .select(dao, function(d) {
    return this.start('li').add(d.id, ' ', d.name, ' ', d.value).end();
  })
  .start('li').add('last').end();


for ( let i = 8 ; i < 18 ; i++ ) {
  window.setTimeout(() => {
    dao.put(SampleData.create({id: 'key' + i, name: 'Mr.', value: '' + i}));
  }, 1000 * (i-7));
}

foam.u2.Element.create().add('children').write();
foam.u2.Element.create().write().add('children');
foam.u2.Element.create().add('entities: ').add('<','here').entity('#xb6').entity('#182').entity('#x2691').entity('#x2699').entity('lt').entity('#x2691').entity('#x2699').add('start').nbsp().add('end').write();
foam.u2.Element.create({nodeName: 'b'}).add('children').write();
foam.u2.Element.create({nodeName: 'b'}).write().add('children');
foam.u2.Element.create().style({color: 'red'}).add('children').write();
foam.u2.Element.create().write().style({color: 'red'}).add('children');
foam.u2.Element.create().on('click', () => console.log('clicked')).add('clickme').write();
foam.u2.Element.create().write().on('click', () => console.log('clicked')).add('clickme');


foam.u2.Element.create().write().start('ol').forEach(['a','b','c'], function(v) {
  this.start('li').add(v).end();
});

foam.u2.Element.create().write().start('ul').repeat(1, 10, function(v) {
  this.start('li').add(v).end();
});

foam.u2.Element.create().write().add(function() {
  this.add('here','I','am');
});

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
    .orange { color: orange; }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'state'
    },
    {
      class: 'Int',
      name: 'count'
    }
  ],

  methods: [
    function render() {
      var self = this;

      this.addClass();
      this.start('input', {tabIndex: 3, data: 'focused'});
      this.start('input', {tabIndex: 2, data: 'focused'});
      this.start('input', {tabIndex: 1, data: 'focused'});
      this.style({background: 'lightgray'});
      this.start(null, {tooltip: 'tooltip'}).add('hover for tooltip');
      this.start(null, {tooltip: 'title tooltip'}).setAttribute('title', 'title tooltip').add('hover for title tooltip');
      this.add('before');
      this.start('h1')
        .add('Dynamic Test 1')
        .enableClass(this.myClass('tick'), this.state$)
      .end();
      this.start('h2').add('Dynamic Test 2').end();
      this.add('after');
      this.br();
      this.add('state: ', this.state, ' ', this.state$);
      this.br();
      this.start().addClass('orange').add('orange').end();
      this.start().addClass('orange').removeClass('orange').add('not orange').end();
      this.start().style({color: 'green'}).add('green style').end();
      var gone = this.start().add('gone');
      gone.remove();
      this.add(this.slot(function(state) {
        return state ? 'ping' : 'pong';
      }));
      this.add(function(state, count) {
        this.start('b').add(count, ' ').end();
        if ( state ) {
          this.start('b').add('ping').end();
        } else {
          this.start('i').add('pong').end();
        }
      });

      this.start().setID(42).add('has id set').end();

      this.tag('hr');
      this.tick();
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        this.count++;
        this.state = ! this.state;
        this.tick();
      }
    }
  ]
});

//var dt = DynamicTest.create().write();
