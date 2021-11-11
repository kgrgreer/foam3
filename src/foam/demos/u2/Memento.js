// TODO:
//   name collision support
//   output empty/default names when collision occurs
//   support "sticky" localStorage/config properties
//   feedback elimination?
//   eliminate need for implementing Memorable by having property install!
//     -- maybe a bad idea

// IDEA:
// traverse from top-level object?
//   what about intermediate objects that don't know they're memorable?
//   ?? two modes: properties vs subContext?
// use sub-context?
//   What about when merging more than one memorable child?
// What if frames were memorable objects?
// Can we merge Memento and Memorable and avoid having two objects?
// Memorable: mementoStr_, mementoBindings_, mementoFreeBindings_, memento_ (parent memento), exports as memento_
// memProps_, memStr_, memBindings_, memFreeBindings_, memento_, exports as memento_

// Workable?
// if str updates -> bindings update -> free bindings update -> pass to child bindings
// if property updates, how to update top-level String?
// if property changes, update bindings -> update parent free bindings -> recursively, at top, update str

// Maybe get rid of bindings and freebindings and just use str and tail?
// need a top-level updateStr method? or tail goes down and then back up?

// explicitly create multiple sub-contexts (siblings) when required?


foam.CLASS({
  name: 'Memento',

  properties: [
    'memento_',
    {
      // memorable object
      name: 'obj'
    },
    {
      name: 'props',
      factory: function() {
        return this.obj.cls_.getAxiomsByClass(foam.core.Property).filter(p => p.memorable);
      }
    },
    {
      class: 'String',
      name: 'str',
      displayWidth: 100,
      postSet: function(_, s) {
        console.log('STR: ', s);
        // parser & separated string of key=value bindings and store in b
        var bs = [];

        var i = s.indexOf('?');
        if ( i != -1 ) {
          var route = s.substring(0, i).split('/');
          s = s.substring(i+1);
          s = route.map(p => 'route=' + p).join('&') + (s ? '&' + s : '');
        }
        console.log('STR2: ', s);

        s.split('&').forEach(p => {
          var [k,v] = p.split('=');
          bs.push([k, v]);
        });

        function consumeBinding(k) {
          // find and remove a binding from bindings 'b'
          for ( var i = 0 ; i < bs.length ; i++ ) {
            var kv = bs[i];
            if ( kv[0] == k ) {
              bs.splice(i,1);
              return kv[1];
            }
          }
        }

        // Remove bindings for 'obj' properties and set remaining bindings in 'tail'
        this.props.forEach(p => {
          var value = consumeBinding(p.shortName || p.name);
          this.obj[p.name] = value;
        });

        this.tailStr = this.encodeBindings(bs);
      }
    },
    'tail',
    'tailStr',
    'usedStr'
  ],

  methods: [
    function init() {
      this.props.forEach(p => {
        this.obj.slot(p.name).sub(this.update);
      });
      if ( this.memento_ ) {
        this.memento_.tail = this;
        this.str           = this.memento_.tailStr;
        this.obj.onDetach(() => {
          // TODO: make own method
          if ( this.memento_.tail == this ) {
            this.memento_.tail = null;
            this.memento_.update();
          }
        });
      }
    },

    function getBoundNames(opt_set) {
      var s = opt_set || {};

      this.props.forEach(p => s[p.shortName || p.name] = true);

      if ( this.tail ) this.tail.getBoundNames(s);

      return s;
    },

    function encodeBindings(bs) {
      /** Encode an array of bindings as a & deliminted key=value string. **/
      var s = '';
      bs.forEach(b => {
        if ( s ) s += '&';
        s += b[0] + '=' + b[1];
      });
      return s;
    },

    function toString() {
      var p = this.encode();
      var s = p.route;
      if ( p.params ) {
        if ( s ) s += '?';
        s += p.params;
      }
      return s;
    },

    function encode() {
      var s = '', route = '', set = {};

      if ( this.tail ) {
        set = this.getBoundNames();
      }

      this.props.forEach(p => {
        var value = this.obj[p.name];
        if ( p.name === 'route' ) {
          route = this.obj.route;
        } else {
          if ( this.obj.hasOwnProperty(p.name) || set[p.shortName || p.Name] ) {
            if ( s ) s += '&';
            var val = this.obj[p.name];
            if ( val === undefined ) val = '';
            s += (p.shortName || p.name) + '=' + val;
          }
        }
      });

      if ( this.tail ) {
        var e2 = this.tail.encode();
        var s2 = e2.params;
        if ( e2.route ) {
          route += '/' + e2.route;
        }
        if ( s2 ) {
          if ( s ) { s = s + '&' + s2; } else { s = s2; }
        }
      }

      return {route: route, params: s};
    }
  ],

  listeners: [
    {
      name: 'update',
      isMerged: true,
      mergeDelay: 32,
      code: function() {
        /* Called when a memento property is updated. */
        this.usedStr = this.toString();
        if ( this.memento_ ) this.memento_.update();
      }
    }
  ]
});


foam.CLASS({
  name: 'MemorablePropertyRefinement',
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'Boolean',
      name: 'memorable'
    }
  ]
});


foam.CLASS({
  name: 'Memorable',

  imports: [ 'memento_? as parentMemento_' ],
  exports: [ 'memento_' ],

  properties: [
    {
      name: 'memento_',
      hidden: true,
      factory: function() { return Memento.create({obj: this, memento_: this.parentMemento_}); }
    }
  ],

  methods: [
    function removeMementoTail() {
      // TODO
    }
  ]
});


/////////////////////////////////////////////////////////////////// DEMO

foam.CLASS({
  name: 'Menu',
  extends: 'foam.u2.Controller',

  mixins: [
    'Memorable'
  ],

  properties: [
    {
      name: 'route',
      memorable: true,
      postSet: function(_, m) {
        this.controller = Controller.create({daoKey: m}, this);
      }
    },
    {
      class: 'FObjectProperty',
      name: 'controller',
      of: 'Controller',
      factory: function() { return Controller.create({}, this); }
    }
  ],

  methods: [
    function render() {
      this.br();
      this.add("MENU");
      this.br();
      this.add('str: ', this.memento_.str$);
      this.br();
      this.add('tailStr: ', this.memento_.tailStr$);
      this.br();
      this.add('usedStr: ', this.memento_.usedStr$);
      this.br();
      this.add('Menu/Route: ', this.ROUTE);
      this.add(this.controller$);
      /*
      this.add(this.slot(function(menu) {
        return this.E().add(this.controller);
      });
      */
    }
  ]
});


foam.CLASS({
  name: 'Controller',
  extends: 'foam.u2.Controller',

  mixins: [
    'Memorable'
  ],

  properties: [
    {
      name: 'daoKey'
    },
    {
      name: 'route',
      value: 'edit',
      memorable: true
    },
    {
      class: 'Int',
      name: 'id',
      memorable: true
    },
    {
      class: 'FObjectProperty',
      name: 'table',
      of: 'Table',
      factory: function() { return Table.create({}, this); }
    }
  ],

  methods: [
    function render() {
      this.br();
      this.add("CONTROLLER: ", this.daoKey);
      this.br();
      this.add('str: ', this.memento_.str$);
      this.br();
      this.add('tailStr: ', this.memento_.tailStr$);
      this.br();
      this.add('usedStr: ', this.memento_.usedStr$);
      this.br();
      this.add('Mode/Route: ', this.ROUTE);
      this.add('Id: ', this.ID);
      this.add(this.table);
    }
  ]
});


foam.CLASS({
  name: 'Table',
  extends: 'foam.u2.Controller',

  mixins: [
    'Memorable'
  ],

  properties: [
    {
      class: 'Int',
      name: 'skip',
      shortName: 's',
      value: 10,
      memorable: true
    },
    {
      //class: 'StringArray',
      class: 'String',
      name: 'columns',
      memorable: true,

      sticky: true
    },
    {
      name: 'query',
      shortName: 'q',
      memorable: true
    }
  ],

  methods: [
    function render() {
      this.br();
      this.add("TABLE");
      this.br();
      this.add('str: ', this.memento_.str$);
      this.br();
      this.add('tailStr: ', this.memento_.tailStr$);
      this.br();
      this.add('usedStr: ', this.memento_.usedStr$);
      this.br();
      this.add('Skip: ',    this.SKIP);
      this.add('Columns: ', this.COLUMNS);
      this.add('Query: ',   this.QUERY);
    }
  ]
});


foam.CLASS({
  name: 'MementoTest',
  extends: 'foam.u2.Controller',

  exports: [ 'memento_' ],

  mixins: [ 'Memorable' ],

  properties: [
    {
      name: 'skip',
      shortName: 's',
      value: 10,
      memorable: true
    },
    {
      // class: 'StringArray',
      class: 'String',
      name: 'columns',
      memorable: true,
      sticky: true
    },
    {
      name: 'query',
      shortName: 'q',
      memorable: true
    },
    {
      name: 'abc'
    },
    {
      class: 'FObjectProperty',
      name: 'menu',
      of: 'Menu',
      factory: function() { return Menu.create({}, this); }
    }
  ],

  methods: [
    function render() {
      // this.subMemento.str = 'q=something';
      this.startContext({data: this.memento_}).add(this.memento_.STR).endContext();
      this.br().br();
      this.add('str: ', this.memento_.str$);
      this.br();
      this.add('tailStr: ', this.memento_.tailStr$);
      this.br();
      this.add('usedStr: ', this.memento_.usedStr$);
      this.br();
      this.br();
      this.add('skip: ', this.SKIP);
      this.br();
      this.add('query: ', this.QUERY);
      this.br();
      this.add(this.menu);
    }
  ]
});


/*
// Map of key->start pos bindings, is updated as bindings are consumed.
var ps = {};

// Update frame bindings
for ( var i = 0 ; i < this.frames.length ; i++ ) {
  var frame = this.frames[i];

  for ( var key in frame ) {
    var slot  = frame[key];
    var value = this.get(key, ps);
    if ( value !== undefined ) slot.set(value);
  }
}
*/
