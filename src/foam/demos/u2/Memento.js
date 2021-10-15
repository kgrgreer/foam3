// TODO:
//   name collision support
//   output empty/default names when collision occurs
//   support path vs. param mementos
//   support "sticky" localStorage/config properties
//   feedback elimination?
//   eliminate need for implementing Memorable by having property install!


foam.CLASS({
  name: 'Memento',

  properties: [
    {
      // stores all bindings, even those that aren't currently being used
      name: 'bindings',
      factory: function() { return {}; }
    },
    {
      name: 'frames',
      factory: function() { return []; }
    },
    {
      class: 'String',
      name: 'str',
      displayWidth: 100,
      postSet: function(_, s) {
        var m = {};
        s.split('&').forEach(p => {
          var [k,v] = p.split('=');
          m[k] = v;
        });
        this.bindings = m;

        // Update frame bindings
        for ( var i = 0 ; i < this.frames.length ; i++ ) {
          var frame = this.frames[i];
          for ( var key in frame) {
            var slot = frame[key];

            if ( m.hasOwnProperty(key) ) slot.set(m[key]);
          }
        }
      }
    }
  ],

  methods: [
    function init() {
//      this.str = this.toString();
    },

    function bind(memorable) {
      var bindings = {};

      memorable.cls_.getAxiomsByClass(foam.core.Property).filter(p => p.memorable).forEach(p => {
        console.log('**** MEMORABLE ', p.name);
        var slot = memorable.slot(p.name)
        bindings[p.shortName || p.name] = slot;
        memorable.onDetach(memorable.sub(this.update));
      });

      var l = this.bindings.length;
      memorable.onDetach(() => this.frames.length = l);
      this.frames.push(bindings);
    },

    function toString() {
      var str = '';

      for ( var i = 0 ; i < this.frames.length ; i++ ) {
        var frame = this.frames[i];
        for ( var key in frame) {
          var slot = frame[key];
          if ( slot.get() ) {
            if ( str ) str = str + '&';
            str = str + key + '=' + slot.get();
          }
        }
      }

      return str;
    }
  ],

  listeners: [
    {
      name: 'update',
      isMerged: true,
      mergeDelay: 160,
      code: function() {
        this.str = this.toString();
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

  properties: [
    {
      name: 'memento',
      hidden: true,
      factory: function() { return this.__context__.memento || Memento.create(); },
      initObject: function(memorable) {
        memorable.memento.bind(memorable);
      }
    }
  ]
});


foam.CLASS({
  name: 'MementoTest',
  extends: 'foam.u2.Controller',

  mixins: [
    'Memorable'
  ],

  properties: [
    {
      name: 'skip',
      shortName: 's',
      value: 10,
      memorable: true,
      sticky: true
    },
    {
      class: 'StringArray',
      name: 'columns',
      memorable: true,
      sticky: true
    },
    {
      name: 'limit',
      memorable: true
    },
    {
      name: 'query',
      shortName: 'q',
      memorable: true
    },
    {
      name: 'abc'
    }
  ],

  methods: [
    function render() {
      // this.subMemento.str = 'q=something';
      this.startContext({data: this.memento}).add(this.memento.STR).endContext();
      this.br();
      this.add(this.memento.str$);
      this.br();
      this.add('skip: ', this.SKIP);
      this.br();
      this.add('limit: ', this.LIMIT);
      this.br();
      this.add('query: ', this.QUERY);
      this.br();
    }
  ]
});
