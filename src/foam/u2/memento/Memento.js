foam.CLASS({
  package: 'foam.u2.memento',
  name: 'Memento',

  // IDEA: support "sticky" localStorage/config properties
  // TODO: do we need to generate memento_ on init?

  documentation: `
    A hierarchical implementation of the Memento pattern.
    Used to encode UI states/routes in a string form that can be stored and later
    reverted to. Can be used to implement back/forth support or bookmarking.
    Can be two-way linked to the window location hash.

    Memento mapping is handled automatically by marking properties as memorable: true.
    Memorable properties are automatically encoded-into / extracted-from the string
    form of the memento and a sub-Memento with the used bindings removed is exported
    for children to consume.

    If a Property specifies a 'shortName', it will be used as the properties key
    instead of the properties 'name'.

    If a Property is named 'route', it will be encoded as part of the memento
    path, rather than as a keyed paramater.

    The format for memento strings is:
    #path1/path2/...pathn?key1=value1&key2=value2...&keyn=valuen

    Which is short form for:
    #route=path1&route=path2&route=path3&key1=value1&key2=value2...&keyn=valuen

    Notice that you can have more than one key=value pair for the same key.
    In the event of duplicates bindings are assigned from top-down.

    To make a model memorable, just add:

    mixins: [
      'Memorable'
    ],

    And then add "memorable: true" to properties you wish to memorable.
  `,

  properties: [
    {
      name: 'memento_',
      documentation: 'The parent Memento for this Mementio (memento_.tail == this).'
    },
    {
      name: 'obj',
      documentation: 'Object to be made memorable. Can be null if this is the top-level memento.'
    },
    {
      name: 'props',
      documentation: 'The properties of "obj" that have the Property.memorable: true.',
      factory: function() {
        return this.obj.cls_.getAxiomsByClass(foam.core.Property).filter(p => p.memorable);
      }
    },
    {
      class: 'String',
      name: 'str',
      documentation: 'String input memento. Used to set the memento from a String.',
      displayWidth: 100,
      postSet: function(_, s) {
        // parser & separated string of key=value bindings and store in bs
        var bs = [];

        s = this.addRouteKeys(s);

        if ( s ) {
          bs = this.createBindings(s);
        }

        function consumeBinding(k) {
          // find and remove a binding from bindings 'bs'
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
          // Required to avoid setting memento props as the string 'undefined'
          if ( !! value )
            this.obj[p.name] = value;
        });

        this.tailStr = this.encodeBindings(bs);
      }
    },
    {
      class: 'Boolean',
      name: 'shouldDetach'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'tails',
      documentation: 'Stores all sub-mementos that are linked to this Memento'
    },
    {
      name: 'tail',
      documentation: 'Currently active Sub-Memento, if it exists.'
    },
    {
      name: 'tailStr',
      documentation: 'Bindings from "str" with used bindings removed. Becomes "str" of "tail".',
      postSet: function(_, s) {
        if ( this.tail ) this.tail.str = s;
      }
    },
    {
      name: 'usedStr',
      documentation: 'Only the bindings from "str" that are used by this Memorable or sub-Mementos. Should be used when storing memento as a String.',
      factory: function () { return this.toString(); }
    }
  ],

  methods: [
    function init() {
      if ( ! this.obj ) return;

      // Listen for changes to any memorable Properties
      this.props.forEach(p => {
        this.obj.slot(p.name).sub(this.update);
      });

      // Connect to parent Memento if it exists.
      if ( this.memento_ ) {
        this.memento_.tails.push(this);
        this.memento_.tail = this;
        this.str           = this.memento_.tailStr;
      }
    },

    function createBindings(s) {
      let arr = [];
      // Do not split inside '{}', can be used as an escape char
      // This only works for one level of nesting, can we use a foam parser?
      s.split(/&(?=[^\}]*(?:\{|$))/).forEach(p => {
        // Limit split to one in order to preserve nested mementos
        var [k,v] = p.split(/=(.*)/, 2)
        arr.push([k,v]);
      });
      return arr;
    },

    function getBoundNames(set) {
      if ( this.obj ) {
        this.props.forEach(p => set[p.shortName || p.name] = true);

        if ( this.tail ) this.tail.getBoundNames(set);
      }
    },

    function addRouteKeys(s) {
      if ( s && s.indexOf('=') == -1 ) s += '?';
      var i = s.indexOf('?');
      if ( i != -1 ) {
        var route = s.substring(0, i).split('/');
        s = s.substring(i+1);
        s = route.map(p => 'route=' + p).join('&') + (s ? '&' + s : '');
      }
      return s
    },

    function encodeBindings(bs) {
      /** Encode an array of [key,value] bindings as a & deliminted key=value string. **/
      var s = '';
      bs.forEach(b => {
        if ( s ) s += '&';
        s += b[0] + '=' + b[1];
      });
      return s;
    },

    function toString(encoded, opt_limit) {
      /** Converts this Memento (and tail) to path?params encoded String. **/
      var e = encoded || this.encode(opt_limit);
      var s = e.route;
      if ( e.params ) {
        if ( s ) s += '?';
        s += e.params;
      }
      return s;
    },

    function encode(opt_limit) {
      /** Recursively encode memento as a {route: "route1/route2/...", params: "key1=value1&key2=value2..."} map. **/
      var s = '', route = '', hasRoute = false, set = {};

      if ( this.tail )
        this.tail.getBoundNames(set);

      if ( this.obj ) this.props.forEach(p => {
        var value = this.obj[p.name];
        if ( p.name === 'route' || p.shortName === 'route' ) {
          route = this.obj[p.name];
          hasRoute = true;
        } else {
          if ( this.obj[p.name] || set[p.shortName || p.name] ) {
            if ( s ) s += '&';
            var val = this.obj[p.name];
            if ( val && this.cls_.isInstance(val) ) val = `{${val.usedStr}}`;
            if ( val === undefined ) val = '';
            s += (p.shortName || p.name) + '=' + val;
          }
        }
      });

      if ( this.tail && this.tail != opt_limit ) {
        var e2 = this.tail.encode();
        // set the usedStr for the tail
        this.tail.usedStr = this.tail.toString(e2);
        var s2 = e2.params;
        if ( e2.route ) {
          if ( hasRoute ) route += '/';
          route += e2.route;
        }
        if ( s2 ) {
          if ( s ) { s = s + '&' + s2; } else { s = s2; }
        }
      }

      return {route: route, params: s};
    }
  ],

  listeners: [
    function removeMementoTail() {
      // Logging to track memento issues
      console.log('Detaching tail ', this.obj?.cls_.name, this.tailStr);
      this.tail = null;
      this.tails = [];
      this.tailStr = undefined;
      this.update();
    },
    {
      name: 'update',
      documentation: `
        Called when a Memento Property is updated.
        Causes usedStr of this Memento and parents to be updated.
        Is merged to avoid multiple updates when multiple properties update at once.
      `,
      isMerged: true,
      mergeDelay: 32,
      code: function() {
        if ( this.memento_ ) {
          // If parent has more than one child set this memento_ as parent's tail
          // Useful where there are multiple child views using mementos for a single parent
          // Eg. two embedded table view under one summary view 
          if ( this.memento_.tails.length > 1 && this.memento_.tail != this ) { this.memento_.tail = this; }
          this.memento_.update();
        } else {
          this.usedStr = this.toString();
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.memento',
  name: 'WindowHashMemento',
  extends: 'foam.u2.memento.Memento',

  documentation: `
    A Memento with support for binding to the windows location hash.
    The top-level Memento in the system should be a WindowHashMemento.
  `,

  imports: [ 'window' ],

  properties: [
    {
      class: 'Boolean',
      name: 'feedback_'
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.onHashChange();
      this.window.onpopstate = this.onHashChange;
      this.usedStr$.sub(this.onMementoChange);
    },

    function deFeedback(fn) {
      /** Call the supplied function with feedback elimination. **/
      if ( this.feedback_ ) return;
      this.feedback_ = true;
      try { fn(); } catch(x) {}
      this.feedback_ = false;
    }
  ],

  listeners: [
    {
      name: 'onHashChange',
      documentation: 'Called when the window hash is updated, causes update to memento.',
      code: function() {
        this.deFeedback(() => { this.str = decodeURI(this.window.location.hash.substring(1)); });
      }
    },
    {
      name: 'onMementoChange',
      documentation: 'Called when the memento changes, causes update to hash.',
      code: function() {
        this.deFeedback(() =>  this.window.location.hash = '#' + this.usedStr);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.memento',
  name: 'MemorablePropertyRefinement',
  refines: 'foam.core.Property',

  documentation: 'Add "memorable" Property to Property.',

  properties: [
    {
      class: 'Boolean',
      documentation: "If true, this Property will be included in Mementos and it's value will be copied from Mementos.",
      name: 'memorable'
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.memento',
  name: 'Memorable',

  requires: [
    'foam.u2.memento.Memento',
    'foam.u2.memento.WindowHashMemento'
  ],

  documentation: 'Mixin to make a model Memorable',

  imports: [ 'memento_? as parentMemento_' ],
  exports: [ 'memento_' ],

  properties: [
    {
      name: 'memento_',
      documentation: 'Memento bound to this object.',
      hidden: true,
      initObject: function(obj) { obj.memento_; },
      factory: function() {
        // If no top-level Memento found, then create a WindowHashMemento to be
        // the top-level one.
        return this.parentMemento_ ?
          this.Memento.create({obj: this, memento_: this.parentMemento_}, this) :
          this.WindowHashMemento.create({obj: this}, this);
      }
    }
  ]
});
