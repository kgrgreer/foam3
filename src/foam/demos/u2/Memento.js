foam.CLASS({
  name: 'Memento',

  properties: [
    'parent',
    'unbound',
    'bound',
    'str'
  ],

  methods: [
    function init() {
      this.str = this.toString();
      for ( var key in this.bound ) {
        this.onDetach(this.bound[key].sub(this.update));
      }
    },

    function bind(map) {
    },

    function toString() {
      var str = this.parent ? this.parent.toString() : '';
      for ( var key in this.bound ) {
        var slot = this.bound[key];
        if ( slot.get() ) {
          if ( str ) str = str + '&';
          str = str + key + '=' + slot.get();
        }
      }
      return str;j
    }
  ],

  listeners: [
    {
      name: 'update',
      isFramed: true,
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

  exports: [
    'subMemento'
  ],

  properties: [
    {
      name: 'memento',
      hidden: true
    },
    {
      name: 'subMemento',
      hidden: true,
      initObject: function(memorable) {
        var bindings = {};

        this.sourceCls_.getAxiomsByClass(foam.core.Property).filter(p => p.memorable).forEach(p => {
          console.log('**** MEMORABLE ', p.name);
          bindings[p.shortName || p.name] = memorable.slot(p.name);
        });

        memorable.subMemento = Memento.create({bound: bindings});
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
      memorable: true
    },
    {
      name: 'limit',
      memorable: true
    },
    {
      name: 'query',
      shortName: 'q',
      value: 'something',
      memorable: true
    },
    {
      name: 'abc'
    }
  ],

  methods: [
    function render() {
      this.add('mementotest #');
      this.add(this.subMemento.str$);
    }
  ]
});
