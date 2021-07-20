/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/*
TODO:
 - Remove use of E() and replace with create-ing axiom to add same behaviour.
 - start('leftPanel') should work for locating pre-existing named spaces
 - Don't generate .java and remove need for flags: ['js'].
*/

/*
PORTING U2 to U3:
  - rename render to render()
  - when setting nodeName value, set to lower-case
    ie. ['nodeName', 'DIV'] -> ['nodeName', 'div']
  - move init() rendering code to render()
  - replace use of setNodeName to setting the nodeName property
  - remove use of this.sub('onload')
  - replace unload() with remove()
  - replace this.sub('onunload') with this.onDetach()
  - el() is now synchronous instead of returning a Promise
  - the Element.state property no longer exists
  - innerHTML and outerHTML have been removed
  - replace ^ in CSS (which has meaning in CSS) with <<
  - ILLEGAL_CLOSE_TAGS and OPTIONAL_CLOSE_TAGS have been removed
  - this.addClass() is the same as this.addClass()
  - automatic ID generation has been removed
  - replace use of slots that return elements with functions that add them
  - remove daoSlot() method
  -    TODO: https://github.com/foam-framework/foam2/search?q=daoSlot
  - remove cssClass() (use addClass() instead
  -    TODO: https://github.com/foam-framework/foam2/search?q=cssClass
  - callOn removed
  - remove entity() support
  - remove addBefore()
  - remove insertAt_()
  - remove insertBefore()
  - remove insertAfter()
  - remove slotE_()
  - remove initTooltip
  - removed use of SPAN tags for dynamic slot content by using reference to TextNode
  - NEXT_ID() removed. Use new Object().$UID instead.

.add(this.slot(function(a, b, c) { return this.E().start()...; }));
becomes:
.add(function(a, b, c) { this.start()...; });

  TODO:
  - Is it faster if we don't add child to parent until we call end()?
  - consistently use _ for all internal properties and methods
  - ??? remove removeChild() appendChild()
  - ??? replace replaceChild() with replace() on Node
  - ??? replace E() with custom Element constructor
  - Replace TableCellFormatters with Elements
  - ??? Replace toE() with toNode/toView/to???
  - you can use views directly instead of ViewSpecs
  - could we get rid of subSubContext be updating subContext?
*/

foam.ENUM({
  package: 'foam.u2',
  name: 'ControllerMode',

  documentation: 'CRUD controller modes: CREATE/VIEW/EDIT.',

  properties: [
    {
      class: 'String',
      name: 'modePropertyName'
    },
    {
      name: 'restrictDisplayMode',
      value: function(mode) { return mode; }
    }
  ],

  methods: [
    function getVisibilityValue(prop) {
      return prop.visibility || prop[this.modePropertyName];
    }
  ],

  values: [
    {
      name: 'CREATE',
      modePropertyName: 'createVisibility'
    },
    {
      name: 'VIEW',
      modePropertyName: 'readVisibility',
      restrictDisplayMode: function(mode) {
        return mode == foam.u2.DisplayMode.RW ? foam.u2.DisplayMode.RO : mode;
      }
    },
    {
      name: 'EDIT',
      modePropertyName: 'updateVisibility'
    }
  ]
});


foam.ENUM({
  package: 'foam.u2',
  name: 'DisplayMode',

  documentation: 'View display mode; how or if a view is displayed.',

  properties: [
    {
      name: 'restrictDisplayMode',
      value: function(mode) { return mode === foam.u2.DisplayMode.RW ? this : mode; }
    }
  ],

  values: [
    { name: 'RW', label: 'Read-Write' },
    { name: 'DISABLED' },
    { name: 'RO', label: 'Read-Only' },
    { name: 'HIDDEN', restrictDisplayMode: function() { return foam.u2.DisplayMode.HIDDEN; } }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Node',

  imports: [
    'document'
  ],

  properties: [
    'element_'
  ],

  methods: [
    function toE() { return this; },

    function isLiteral(o) {
      return foam.String.isInstance(o) || foam.Number.isInstance(o) || foam.Boolean.isInstance(o);
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Text',
  extends: 'foam.u2.Node',

  documentation: 'U3 Text Node',

  properties: [
    { class: 'String', name: 'text' },
    {
      name: 'element_',
      factory: function() { return this.document.createTextNode(this.text); }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'SlotNode',
  extends: 'foam.u2.Node',

  properties: [
    'slot',
    {
      name: 'element_',
      // Create a placeholder to insert into the right location, to be replaced
      // by slot value.
      factory: function() { return this.document.createTextNode(''); }
    }
  ],

  methods: [
    function load() {
      this.SUPER();
      this.slot.sub(this.update);
      this.update();
    }
  ],

  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        var val = this.slot.get();
        var e;
        if ( val === undefined || val === null ) {
          e = foam.u2.Text.create({}, this);
        } else if ( this.isLiteral(val) ) {
          e = foam.u2.Text.create({text: val}, this);
        } else if ( foam.u2.Element.isInstance(val) ) {
          e = val;
        } else {
          console.log('Unknown slot type: ', typeof val);
//          debugger;
        }
        this.element_.parentNode.replaceChild(e.element_, this.element_);
        this.element_ = e.element_;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'FunctionNode',
  extends: 'foam.u2.Element',

  properties: [
    'self',
    'code',
    {
      name: 'args',
      factory: function() { return foam.Function.argNames(this.code).map(a => this.self.slot(a)); }
    }
  ],

  methods: [
    function load() {
      this.SUPER();

      var args = this.args;
      for ( var i = 0 ; i < args.length ; i++ ) {
        this.self.onDetach(args[i].sub(this.update));
      }

      this.update();
    }
  ],

  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        this.removeAllChildren();
        this.code.apply(this, this.args.map(a => a.get()));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'DAOSelectNode',
  extends: 'foam.u2.Element',
  implements: [ 'foam.dao.Sink' ],

  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],

  properties: [
    'self',
    'dao',
    'code',
    {
      class: 'Int',
      name: 'batch',
      documentation: `Used to check whether a paint should be performed or not.`
    },
    {
      name: 'element_',
      factory: function() { return this.document.createTextNode(''); }
    },
    {
      class: 'Array',
      name: 'children'
    }
  ],

  methods: [
    function load() {
      this.SUPER();
      this.onDetach(this.dao.listen(this));

      this.update();
    },

    function put(obj, s) {
      this.update();
    },

    function remove(obj, s) {
      this.update();
    },

    function reset() {
      this.update();
    },

    function removeAllChildren() {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        this.children[i].remove();
      }
      this.children = [];
    }
  ],

  listeners: [
    {
      name: 'update',
      isMerged: true,
      mergeDelay: 160,
      code: function() {
        this.removeAllChildren();
        var batch = ++this.batch;
        this.dao.select(d => {
          if ( this.isDetached() || this.batch !== batch ) {
            debugger;
            return;
          }
          var oldSize = this.self.childNodes.length;

          this.self.appendChild_ = c => {
            this.self.element_.insertBefore(c, this.element_);
          };
          var e = this.code.call(this.self, d);
          if ( e ) {
            // TODO: remove after port from U2 to U3
            console.log('Deprecated use of select({return E}). Just do self.start() instead.');
            this.self.tag(e);
          }
          this.self.appendChild_ = foam.u2.Element.prototype.appendChild_;

          var newSize = this.self.childNodes.length;
          for ( var i = oldSize ; i < newSize ; i++ ) {
            this.children.push(this.self.childNodes[i]);
          }
        });
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'CSS',

  documentation: 'Axiom to install CSS.',

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      name: 'name',
      factory: function() { return 'CSS-' + Math.abs(foam.util.hashCode(this.code)); }
    },
    {
      class: 'Boolean',
      name: 'expands_',
      documentation: 'True iff the CSS contains a ^ which needs to be expanded.',
      expression: function(code) {
        return code.includes('^') || code.includes(foam.u2.Element.CSS_SELF);
      }
    }
  ],

  methods: [
    function maybeInstallInDocument(X, cls) {
      var document = X.document;
      if ( ! document ) return;
      var installedStyles = document.installedStyles || ( document.installedStyles = {} );
      if ( this.expands_ ) {
        var map = installedStyles[this.$UID] || (installedStyles[this.$UID] = {});
        if ( ! map[cls.id] ) {
          map[cls.id] = true;
          X.installCSS(this.expandCSS(cls, this.code), cls.id);
        }
      } else {
        if ( ! installedStyles[this.$UID] ) {
          installedStyles[this.$UID] = true;
          X.installCSS(this.expandCSS(cls, this.code), cls.id);
        }
      }
    },

    function installInClass(cls) {
      // Install myself in this Window, if not already there.
      var oldCreate   = cls.create;
      var axiom       = this;
      var isFirstCSS  = ! cls.private_.hasCSS;

      if ( isFirstCSS ) cls.private_.hasCSS = true;

      cls.create = function(args, opt_parent) {
        var X = opt_parent ?
          ( opt_parent.__subContext__ || opt_parent.__context__ || opt_parent ) :
          foam.__context__;

        // Now call through to the original create
        try {
          return oldCreate.call(this, args, X);
        } finally {
          // if a class has inheritCSS: false then finish installing its other
          // CSS axioms, but prevent any parent classes from installing theirs
          // We put this in the context to communicate to other CSSAxioms
          // down the chain. The last/first one will revert back to the original
          // X so that objects aren't created with lastClassToInstallCSSFor
          // in their contexts.
          var lastClassToInstallCSSFor = X.lastClassToInstallCSSFor;

          if ( ! lastClassToInstallCSSFor || lastClassToInstallCSSFor == cls ) {
            // Install CSS if not already installed in this document for this cls
            axiom.maybeInstallInDocument(X, this);
          }

          if ( ! lastClassToInstallCSSFor && ! this.model_.inheritCSS ) {
            X = X.createSubContext({
              lastClassToInstallCSSFor: this,
              originalX: X
            });
          }

          if ( lastClassToInstallCSSFor && isFirstCSS ) X = X.originalX;
        }
      };
    },

    function expandCSS(cls, text) {
      if ( ! this.expands_ ) return text;

      /* Performs expansion of the ^/<< shorthand on the CSS. */
      // TODO(braden): Parse and validate the CSS.
      // TODO(braden): Add the automatic prefixing once we have the parser.
      var base = '.' + foam.String.cssClassize(cls.id);
      return text.replace(/(<<|\^)(.)/g, function(match, _, next) {
        var c = next.charCodeAt(0);
        // Check if the next character is an uppercase or lowercase letter,
        // number, - or _. If so, add a - because this is a modified string.
        // If not, there's no extra -.
        if ( (65 <= c && c <= 90) || (97 <= c && c <= 122) ||
            (48 <= c && c <= 57) || c === 45 || c === 95 ) {
          return base + '-' + next;
        }

        return base + next;
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'DefaultValidator',

  documentation: 'Default Element validator.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function validateNodeName(name) {
      return true;
    },

    function validateClass(cls) {
      // TODO
    },

    function validateAttributeName(name) {
      // TODO
    },

    function validateAttributeValue(value) {
      // TODO
    },

    function validateStyleName(name) {
      // TODO
    },

    function validateStyleValue(value) {
      // TODO
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Element',
  extends: 'foam.u2.Node',

  mixins: [ 'foam.core.Fluent' ],

  documentation: `
    DOM API Element. Root model for all U3 UI components.

    To insert a U3 Element into a regular DOM element, either:

    Add to the end of the imported document:

      el.write();

    Append to the end of a specified parent element:

      parentElement.appendChild(el.element_);
      el.load();

    Or use a foam tag in your markup:

    <foam class="com.acme.mypackage.MyView"></foam>
`,

  requires: [
    'foam.core.PromiseSlot',
    'foam.dao.MergedResetSink',
    'foam.u2.AttrSlot',
    'foam.u2.Entity',
    'foam.u2.RenderSink',
    'foam.u2.Tooltip',
    'foam.u2.ViewSpec'
  ],

  imports: [
    //'elementValidator',
    'framed',
    'getElementById',
    'translationService?'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  constants: [
    {
      // TODO: document
      name: 'CSS_SELF',
      value: '<<'
    },
    {
      name: 'CSS_CLASSNAME_PATTERN',
      factory: function() { return /^[a-z_-][a-z\d_-]*$/i; }
    },
    {
      documentation: `
        Psedo-attributes don't work consistently with setAttribute() so need to
        be set on the real DOM element directly.
      `,
      name: 'PSEDO_ATTRIBUTES',
      value: {
        value:   true,
        checked: true
      }
    },
    {
      name: 'DEFAULT_VALIDATOR',
      type: 'foam.u2.DefaultValidator',
      flags: ['js'],
      factory: function() { return foam.u2.DefaultValidator.create(); }
    },
    {
      documentation: `Keys which respond to keydown but not keypress`,
      name: 'KEYPRESS_CODES',
      value: { 8: true, 13: true, 27: true, 33: true, 34: true, 37: true, 38: true, 39: true, 40: true }
    },
    {
      name: 'NAMED_CODES',
      value: {
        '13': 'enter',
        '37': 'left',
        '38': 'up',
        '39': 'right',
        '40': 'down'
      }
    },
    // ???: alternatively, there could be a sub-class of Element called SVGElement
    {
      name: 'SVG_TAGS',
      value: { svg: true, g: true, rect: true, path: true }
    }
  ],

  messages: [
    {
      name: 'SELECT_BAD_USAGE',
      message: "You're using Element.select() wrong. The function passed to it must return an Element. Don't try to modify the view by side effects."
    }
  ],

  properties: [
    {
      name: 'element_',
      factory: function() {
        return this.SVG_TAGS[this.nodeName] ?
          this.document.createElementNS("http://www.w3.org/2000/svg", this.nodeName) :
          this.document.createElement(this.nodeName);
      }
    },
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Enum',
      of: 'foam.u2.ControllerMode',
      name: 'controllerMode',
      factory: function() { return this.__context__.controllerMode || foam.u2.ControllerMode.CREATE; }
    },
    {
      name: 'content',
      preSet: function(o, n) {
        // Prevent setting to 'this', which wouldn't change the behaviour.
        return n === this ? null : n ;
      }
    },
    {
      class: 'String',
      name: 'tooltip',
      postSet: function(o, n) {
        if ( n && ! o ) {
          this.Tooltip.create({target: this, text$: this.tooltip$});
        }
        return n;
      }
    },
    {
      name: 'parentNode',
      transient: true,
      postSet: function(o, n) {
        n.onDetach(this);
      }
    },
    {
      class: 'Boolean',
      name: 'shown',
      value: true,
      postSet: function(o, n) {
        if ( o === n ) return;
        if ( n ) {
          this.removeClass('foam-u2-Element-hidden');
        } else {
          this.addClass('foam-u2-Element-hidden');
        }
      }
    },
    /*
    {
      class: 'Proxy',
      of: 'foam.u2.DefaultValidator',
      name: 'validator',
      flags: ['js'],
      topics: [],
      factory: function() {
        return this.elementValidator$ ? this.elementValidator : this.DEFAULT_VALIDATOR;
      }
    },
    */
    {
      name: 'nodeName',
      adapt: function(_, v) { return foam.String.toLowerCase(v); },
      value: 'div'
    },
    {
      name: 'attributeMap',
      documentation: 'Same information as "attributes", but in map form for faster lookup',
      transient: true,
      factory: function() { return {}; }
    },
    {
      name: 'attributes',
      documentation: 'Array of {name: ..., value: ...} attributes.',
      factory: function() { return []; },
      postSet: function(_, attrs) {
        this.attributeMap = {};
        for ( var i = 0 ; i < attrs.length ; i++ ) {
          this.attributeMap[attrs[i].name] = attrs[i];
        }
      }
    },
    {
      name: 'classes',
      documentation: 'CSS classes assigned to this Element. Stored as a map of true values.',
      factory: function() { return {}; }
    },
    {
      name: 'css',
      documentation: 'Styles added to this Element.',
      factory: function() { return {}; }
    },
    {
      name: 'childNodes',
      documentation: 'Children of this Element.',
      factory: function() { return []; }
    },
    {
      name: 'elListeners',
      documentation: 'DOM listeners of this Element. Stored as topic then listener.',
      factory: function() { return []; }
    },
    {
      name: 'children',
      documentation: 'Virtual property of non-String childNodes.',
      transient: true,
      getter: function() {
        return this.childNodes.filter(function(c) {
          return typeof c !== 'string';
        });
      }
    },
    {
      class: 'Boolean',
      name: 'focused',
      postSet: function(o, n) {
        if ( n ) this.element_.focus();
      }
    },
    {
      name: 'scrollHeight'
    },
    {
      class: 'Int',
      name: 'tabIndex',
      postSet: function(o, n) {
        this.element_.setAttribute('tabindex', n);
      }
    },
    {
      name: 'clickTarget_'
    },
    {
      name: '__subSubContext__',
      documentation:
        `Current subContext to use when creating children.
        Defaults to __subContext__ unless in a nested startContext().`,
      factory: function() { return this.__subContext__; }
    },
    'keyMap_',
    {
      // TODO: remove after port from U2 to U3
      name: 'onload',
      factory: function() {
        return { sub: function(f) {
          console.warn('Deprecated us of ELement.onload.sub().');
          window.setTimeout(f, 16);
        } };
      }
    }
  ],

  methods: [
    // from state

    // TODO: remove
    function el() {
      return Promise.resolve(this.el_());
    },

    function slotE_(slot) {
      return foam.u2.SlotNode.create({slot: slot}, this);
    },

    function load() {
      // disable adding to content$ during render()
      this.add = function() { return this.add_(arguments, this); }
      this.initKeyboardShortcuts();
      this.render();
      this.add = foam.u2.Element.prototype.add;

      // Is also called in postSet of focused property, but if DOM not added
      // to document yet, then that doesn't work, so try again now.
      if ( this.focused ) this.element_.focus();
    },
    function remove() {
      if ( this.parentNode ) {
        // parent will remove from DOM and detach
        this.parentNode.removeChild(this);
      } else {
        this.element_.remove();
        this.detach();
      }
    },
    function onReplaceChild(oldE, newE) {
      var e = this.el_();
      if ( ! e ) {
        console.warn('Missing Element: ', this.id);
        return;
      }
      // TODO
      oldE.el_().outerHTML = '<' + this.nodeName + ' id=' + this.id + '></' + this.nodeName + '>';
      newE.load && newE.load();
    },

    function getBoundingClientRect() {
      return this.element_.getBoundingClientRect();
    },

    function render() {
    },

    async function observeScrollHeight() {
      // TODO: This should be handled by an onsub event when someone subscribes to
      // scroll height changes.
      var self = this;
      var observer = new MutationObserver(async function(mutations) {
        var el = await self.el();
        self.scrollHeight = el.scrollHeight;
      });
      var config = { attributes: true, childList: true, characterData: true };

      observer.observe(this.element_, config);
      this.onDetach((s) => observer.disconnect());
      return this;
    },

    function evtToCharCode(evt) {
      /* Maps an event keycode to a string */
      var s = '';
      if ( evt.altKey   ) s += 'alt-';
      if ( evt.ctrlKey  ) s += 'ctrl-';
      if ( evt.shiftKey && evt.type === 'keydown' ) s += 'shift-';
      if ( evt.metaKey  ) s += 'meta-';
      s += evt.type === 'keydown' ?
          this.NAMED_CODES[evt.which] || String.fromCharCode(evt.which) :
          String.fromCharCode(evt.charCode);
      return s;
    },

    function initKeyMap_(keyMap, cls) {
      var keyMap;

      if ( ! cls.hasOwnProperty('keyMap__') ) {
        var count = 0;
        keyMap = {};

        var as = cls.getAxiomsByClass(foam.core.Action);

        for ( var i = 0 ; i < as.length ; i++ ) {
          var a = as[i];

          for ( var j = 0 ; a.keyboardShortcuts && j < a.keyboardShortcuts.length ; j++, count++ ) {
            var key = a.keyboardShortcuts[j];

            // First, lookup named codes, then convert numbers to char codes,
            // otherwise, assume we have a single character string treated as
            // a character to be recognized.
            if ( this.NAMED_CODES[key] ) {
              key = this.NAMED_CODES[key];
            } else if ( typeof key === 'number' ) {
              key = String.fromCharCode(key);
            }

            keyMap[key] = a;// .maybeCall.bind(a, this.__subContext__, this);
            /*
            keyMap[key] = opt_value ?
              function() { a.maybeCall(this.__subContext__, opt_value.get()); } :
              a.maybeCall.bind(action, self.X, self) ;
            */
          }
        }

        if ( count == 0 ) keyMap = null;

        cls.keyMap__ = keyMap;
      } else {
        keyMap = cls.keyMap__;
      }

      if ( ! keyMap ) return null;

      var map = {};

      for ( var key in keyMap )
        map[key] = keyMap[key].maybeCall.bind(keyMap[key], this.__subContext__, this);

      return map;
    },

    function initKeyboardShortcuts() {
      /* Initializes keyboard shortcuts. */
      var keyMap = this.initKeyMap_(keyMap, this.cls_);

      // if ( this.of ) count += this.initKeyMap_(keyMap, this.of);
      if ( keyMap ) {
        this.keyMap_ = keyMap;
        var target = this.parentNode || this;

        // Ensure that target is focusable, and therefore will capture keydown
        // and keypress events.
        target.tabIndex = target.tabIndex || 1;

        target.on('keydown',  this.onKeyboardShortcut);
        target.on('keypress', this.onKeyboardShortcut);
      }
    },

    function el_() {
      return this.element_;
    },

    function findChildForEvent(e) {
      var src  = e.srcElement;
      var el   = this.el_();
      var cMap = {};
      var cs   = this.children;

      if ( ! el ) return;

      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c = cs[i];
        cMap[c.id] = c;
      }

      while ( src !== el ) {
        var c = cMap[src.id];
        if ( c ) return c;
        src = src.parentElement;
      }
    },

    function E(opt_nodeName) {
      return this.__subSubContext__.E(opt_nodeName);
    },

    function attrSlot(opt_name, opt_event) {
      /* Convenience method for creating an AttrSlot's. */
      var args = { element: this };

      if ( opt_name  ) args.property = opt_name;
      if ( opt_event ) args.event    = opt_event;

      return this.AttrSlot.create(args);
    },

    function myClass(opt_extra) {
      // Use hasOwnProperty so that class doesn't inherit CSS classname
      // from ancestor FOAM class.
      var f = this.cls_.hasOwnProperty('myClass_') && this.cls_.myClass_;

      if ( ! f ) {
        var base = this.cls_.hasOwnProperty('CSS_CLASS') ?
          this.cls_.CSS_CLASS.split(/ +/) :
          foam.String.cssClassize(this.cls_.id).split(/ +/) ;

        f = this.cls_.myClass_ = foam.Function.memoize1(function(e) {
          return base.map(function(c) { return c + (e ? '-' + e : ''); }).join(' ');
        });
      }

      return f(opt_extra);
    },

    // TODO: what is this for?
    function instanceClass(opt_extra) {
      return this.myClass(this.id + '-' + opt_extra);
    },

    function visitChildren(methodName) {
      /*
        Call the named method on all children.
        Typically used to transition state of all children at once.
        Ex.: this.visitChildren('load');
      */
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c = cs[i];
        c[methodName] && c[methodName].call(c);
      }
    },

    function focus() {
      this.focused = true;
      return this;
    },

    function blur() {
      this.focused = false;
      return this;
    },

    function show(opt_shown) {
      if ( opt_shown === undefined ) {
        this.shown = true;
      } else if ( foam.core.Slot.isInstance(opt_shown) ) {
        this.onDetach(this.shown$.follow(opt_shown));
      } else {
        this.shown = opt_shown;
      }

      return this;
    },

    function hide(opt_hidden) {
      return this.show(
        opt_hidden === undefined              ? false :
        foam.core.Slot.isInstance(opt_hidden) ? opt_hidden.map(function(s) { return ! s; }) :
        ! opt_hidden);
    },

    function setAttribute(name, value) {
      /*
        Set an Element attribute or property.

        If this model has a property named 'name' which has 'attribute: true',
        then the property will be updated with value.
        Otherwise, the DOM attribute will be set.

        Value can be either a string, a Value, or an Object.
        If Value is undefined, null or false, the attribute will be removed.
      */

      // TODO: type checking

      if ( name === 'tabindex' ) this.tabIndex = parseInt(value);

      if ( name === 'title' && ! this.tooltip && value ) {
        this.Tooltip.create({target: this, text$: this.attrSlot('title')});
      }

      // handle slot binding, ex.: data$: ...,
      // Remove if we add a props() method
      if ( name.endsWith('$') ) {
        this[name] = value;
        return;
      }

      var prop = this.cls_.getAxiomByName(name);

      if ( prop &&
           foam.core.Property.isInstance(prop) &&
           prop.attribute )
      {
        if ( typeof value === 'string' ) {
          // TODO: remove check when all properties have fromString()
          this[name] = prop.fromString ? prop.fromString(value) : value;
        } else if ( foam.core.Slot.isInstance(value) ) {
          this.onDetach(this.slot(name).follow(value));
        } else {
          this[name] = value;
        }
      } else {
        if ( value === undefined || value === null || value === false ) {
          this.removeAttribute(name);
          return this;
        }

        if ( foam.core.Slot.isInstance(value) ) {
          this.slotAttr_(name, value);
        } else {
          foam.assert(foam.util.isPrimitive(value), 'Attribute value must be a primitive type.');

          var attr = this.getAttributeNode(name);

          if ( attr ) {
            attr.value = value;
          } else {
            attr = { name: name, value: value };
            this.attributes.push(attr);
            this.attributeMap[name] = attr;
          }

          if ( this.PSEDO_ATTRIBUTES[name] ) {
            this.element_[name] = value;
          } else {
            this.element_.setAttribute(name, value === true ? '' : value);
          }
        }
      }

      return this;
    },

    function removeAttribute(name) {
      /* Remove attribute named 'name'. */
      for ( var i = 0 ; i < this.attributes.length ; i++ ) {
        if ( this.attributes[i].name === name ) {
          this.attributes.splice(i, 1);
          delete this.attributeMap[name];
          if ( this.PSEDO_ATTRIBUTES[name] ) {
            this.element_[name] = '';
          } else {
            this.element_.removeAttribute(name);
          }
          break;
        }
      }
      return this;
    },

    function getAttributeNode(name) {
      /*
        Get {name: ..., value: ...} attributeNode associated
        with 'name', if exists.
      */
      return this.attributeMap[name];
    },

    function getAttribute(name) {
      // TODO: add support for other dynamic attributes also
      // TODO: don't lookup in real DOM if listener present
      if ( this.PSEDO_ATTRIBUTES[name] && this.el_() ) {
        var value = this.el_()[name];
        var attr  = this.getAttributeNode(name);

        if ( attr ) {
          attr.value = value;
        } else {
          attr = { name: name, value: value };
          this.attributes.push(attr);
          this.attributeMap[name] = attr;
        }

        return value;
      }

      /*
        Get value associated with attribute 'name',
        or undefined if attribute not set.
      */
      var attr = this.getAttributeNode(name);
      return attr && attr.value;
    },

    function appendChild_(c) {
      this.element_.appendChild(c);
    },

    function removeChild(c) {
      /* Remove a Child node (String or Element). */
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        if ( cs[i] === c ) {
          cs.splice(i, 1);
          if ( typeof c === 'string' ) {
            this.element_.childNodes[i].remove();
          } else {
            c.element_.remove();
            c.detach();
          }
          break;
        }
      }
      return this;
    },

    function replaceChild(newE, oldE) {
      /* Replace current child oldE with newE. */
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; ++i ) {
        if ( cs[i] === oldE ) {
          cs[i] = newE;
          newE.parentNode = this;
          this.onReplaceChild.call(this, oldE, newE);
          oldE.remove();
          return;
        }
      }
    },

    function addEventListener(topic, listener, opt_args) {
      /* Add DOM listener. */
      this.elListeners.push(topic, listener, opt_args);
      this.addEventListener_(topic, listener, opt_args);
    },

    function removeEventListener(topic, listener) {
      /* Remove DOM listener. */
      var ls = this.elListeners;
      for ( var i = 0 ; i < ls.length ; i += 3 ) {
        var t = ls[i], l = ls[i+1];
        if ( t === topic && l === listener ) {
          ls.splice(i, 3);
          this.onRemoveListener_(topic, listener);
          return;
        }
      }
    },

    function setID(id) {
      /* Explicitly set Element's id. */
      this.id = id;
      this.element_.id = id;
      return this;
    },

    function nbsp() {
      return this.add('\xa0');
    },

    function addClass(cls) { /* Slot | String */
      /* Add a CSS cls to this Element. */
      var self = this;
      if ( cls === undefined ) {
        this.addClass_(null, this.myClass());
      } else if ( foam.core.Slot.isInstance(cls) ) {
        var lastValue = null;
        var l = function() {
          var v = cls.get();
          self.addClass_(lastValue, v);
          lastValue = v;
        };
        this.onDetach(cls.sub(l));
        l();
      } else if ( typeof cls === 'string' ) {
        this.addClass_(null, cls);
      } else {
        this.error('cssClass type error. Must be Slot or String.');
      }

      return this;
    },

    function addClasses(a) {
      a && a.forEach((i) => this.addClass(i));
      return this;
    },

    function enableClass(cls, enabled, opt_negate) {
      /* Enable/disable a CSS class based on a boolean-ish dynamic value. */
      function negate(a, b) { return b ? ! a : a; }

      // TODO: add type checking
      if ( foam.core.Slot.isInstance(enabled) ) {
        var self = this;
        var value = enabled;
        var l = function() { self.enableClass(cls, value.get(), opt_negate); };
        this.onDetach(value.sub(l));
        l();
      } else {
        enabled = negate(enabled, opt_negate);
        var parts = cls.split(' ');
        for ( var i = 0 ; i < parts.length ; i++ ) {
          this.classes[parts[i]] = enabled;
          if ( enabled ) {
            this.element_.classList.add(parts[i]);
          } else {
            this.element_.classList.remove(parts[i]);
          }
        }
      }
      return this;
    },

    function removeClass(cls) {
      /* Remove specified CSS class. */
      if ( cls ) {
        delete this.classes[cls];
        this.element_.classList.remove(cls);
      }
      return this;
    },

    function on(topic, listener, opt_args) {
      /* Shorter fluent version of addEventListener. Prefered method. */
      this.addEventListener(topic, listener, opt_args);
      return this;
    },

    function attr(key, value) {
      this.setAttribute(key, value);
      return this;
    },

    function attrs(map) {
      /* Set multiple attributes at once. */
      for ( var key in map ) this.setAttribute(key, map[key]);
      return this;
    },

    function style(map) {
      /*
        Set CSS styles.
        Map values can be Objects or dynamic Values.
      */
      for ( var key in map ) {
        var value = map[key];
        if ( foam.core.Slot.isInstance(value) ) {
          this.slotStyle_(key, value);
        } else {
          this.style_(key, value);
        }
        // TODO: add type checking for this
      }

      return this;
    },

    function tag(spec, args, slot) {
      /* Create a new Element and add it as a child. Return this. */
      var c = this.createChild_(spec, args);
      this.add(c);
      if ( slot ) slot.set(c);
      return this;
    },

    function br() {
      return this.tag('br');
    },

    function startContext(map) {
      var m = {};
      Object.assign(m, map);
      m.__oldAddContext__ = this.__subSubContext__;
      this.__subSubContext__ = this.__subSubContext__.createSubContext(m);
      return this;
    },

    function endContext() {
      this.__subSubContext__ = this.__subSubContext__.__oldAddContext__;
      return this;
    },

    function createChild_(spec, args) {
      return foam.u2.ViewSpec.createView(spec, args, this, this.__subSubContext__);
    },

    function start(spec, args, slot) {
      /* Create a new Element and add it as a child. Return the child. */
      var c = this.createChild_(spec, args);
      /*
      if ( this.content ) {
        this.content.addChild_(c, this);
      } else {
        this.addChild_(c, this);
      }*/
      this.add(c);

      if ( slot ) slot.set(c);
      return c;
    },

    function end() {
      /* Return this Element's parent. Used to terminate a start(). */
      return this.parentNode;
    },

    function translate(source, opt_default) {
      var translationService = this.translationService;
      if ( translationService ) {
        /* Add the translation of the supplied source to the Element as a String */
        var translation = this.translationService.getTranslation(foam.locale, source, opt_default);
        if ( foam.xmsg ) {
          return this.tag({class: 'foam.i18n.InlineLocaleEditor', source: source, defaultText: opt_default, data: translation});
        }
        return this.add(translation);
      }
      console.warn('Missing Translation Service in ', this.cls_.name);
      opt_default = opt_default || 'NO TRANSLATION SERVICE OR DEFAULT';
      return this.add(opt_default);
    },

    function add() {
      if ( this.content ) {
        this.content.add(arguments, this);
        return this;
      }
      return this.add_(arguments, this);
    },

    function addChild_(c, parentNode) {
      if ( c === null || c === undefined ) return;

      if ( c.toE ) {
        c = c.toE(null, this.__subSubContext__);
      }

      if ( foam.Function.isInstance(c) ) {
        c = foam.u2.FunctionNode.create({self: this, code: c});
      } else if ( foam.core.Slot.isInstance(c) ) {
        c = foam.u2.SlotNode.create({slot: c}, this);
      }
        /*
        var v = this.slotE_(c);
        if ( Array.isArray(v) ) {
          for ( var j = 0 ; j < v.length ; j++ ) {
            var u = v[j];
            es.push(u.toE ? u.toE(null, Y) : u);
          }
        } else {
          this.addChild_(v, parentNode);
        }
        */
      if ( this.isLiteral(c) ) {
        this.appendChild_(this.document.createTextNode(c));
      } else if ( c.then ) {
        this.addChild_(this.PromiseSlot.create({ promise: c }), parentNode);
      } else if ( c.element_ ) {
        this.childNodes.push(c);
        c.parentNode = parentNode;
        this.appendChild_(c.element_);
        c.load && c.load();
      }
    },

    function add_(cs, parentNode) {
      /* Add Children to this Element. */
//      var es = [];
//      var Y = this.__subSubContext__;

      for ( var i = 0 ; i < cs.length ; i++ ) {
        this.addChild_(cs[i], parentNode);
      }
        /*
        // Remove null values
        if ( c === undefined || c === null ) {
          // nop
        } else if ( c.toE ) {
          var e = c.toE(null, Y);
          if ( foam.core.Slot.isInstance(e) ) {
            var v = this.slotE_(c);
            if ( Array.isArray(v) ) {
              for ( var j = 0 ; j < v.length ; j++ ) {
                var u = v[j];
                es.push(u.toE ? u.toE(null, Y) : u);
              }
            } else {
              es.push(v.toE ? v.toE(null, Y) : v);
            }
          } else {
            es.push(e);
          }
        } else if ( Array.isArray(c) ) {
          for ( var j = 0 ; j < c.length ; j++ ) {
            var v = c[j];
            es.push(v.toE ? v.toE(null, Y) : v);
          }
        } else if ( c.then ) {
          this.add(this.PromiseSlot.create({ promise: c }));
        } else if ( typeof c === 'function' ) {
          throw new Error('Unsupported');
        } else {
          // String or Number
          es.push(c);
        }
      }
      */
/*
      if ( es.length ) {
        for ( var i = 0 ; i < es.length ; i++ ) {
          if ( foam.u2.Element.isInstance(es[i]) ) {
            es[i].parentNode = parentNode;
          } else if ( es[i].cls_ && es[i].cls_.id === 'foam.u2.Entity' ) {
            // NOP
          } else {
            es[i] = this.sanitizeText(es[i]);
          }
        }

        // this.childNodes.push.apply(this.childNodes, es);
        // this.onAddChildren.apply(this, es);
      }
      */

      return this;
    },

    // function addBefore(reference) { /*, vargs */
    //   /* Add a variable number of children before the reference element. */
    //   var children = [];
    //   for ( var i = 1 ; i < arguments.length ; i++ ) {
    //     children.push(arguments[i]);
    //   }
    //   return this.insertAt_(children, reference, true);
    // },

    function removeAllChildren() {
      this.element_.innerHTML = '';
      for ( var i = 0 ; i < this.childNodes.length ; i++ ) {
        this.childNodes[i].detach();
      }
      this.childNodes = [];
      return this;
    },

    function repeat(s, e, f) {
      // TODO: support descending
      for ( var i = s ; i <= e ; i++ ) {
        f.call(this, i);
      }
      return this;
    },

    /**
     * Given a DAO and a function that maps from a record in that DAO to an
     * Element, call the function with each record as an argument and add the
     * returned elements to the view.
     * Will update the view whenever the contents of the DAO change.
     * @param {DAO<T>} dao The DAO to use as a data source
     * @param {T -> Element} f A function to be called on each record in the DAO. Should
     * return an Element that represents the view of the record passed to it.
     * @param {Boolean} update True if you'd like changes to each record to be put to
     * the DAO
     */
    function select(dao, f, update, opt_comparator) {
      this.add(foam.u2.DAOSelectNode.create({
        self: this,
        dao: dao,
        code: f
      }));
      return this;
    },

    function write() {
      this.document.body.appendChild(this.element_);
      this.load();
      return this;
    },

    function toString() {
      return this.cls_.id + '(id=' + this.id + ', nodeName=' + this.nodeName + ')';
    },

    // function insertAt_(children, reference, before) {
    //   // (Element[], Element, Boolean)
    //
    //   var i = this.childNodes.indexOf(reference);
    //
    //   if ( i === -1 ) {
    //     this.__context__.warn("Reference node isn't a child of this.");
    //     return this;
    //   }
    //
    //   if ( ! Array.isArray(children) ) children = [ children ];
    //
    //   var Y = this.__subSubContext__;
    //   children = children.map(e => {
    //     e = e.toE ? e.toE(null, Y) : e;
    //     e.parentNode = this;
    //     return e;
    //   });
    //
    //   var index = before ? i : (i + 1);
    //   this.childNodes.splice.apply(this.childNodes, [index, 0].concat(children));
    //
    //   /*
    //   this.state.onInsertChildren.call(
    //     this,
    //     children,
    //     reference,
    //     before ? 'beforebegin' : 'afterend');
    //     */
    //
    //   return this;
    // },

    function addClass_(oldClass, newClass) {
      /* Replace oldClass with newClass. Called by cls(). */
      if ( oldClass === newClass ) return;
      if ( oldClass ) this.removeClass(oldClass);
      if ( newClass ) {
        if ( ! this.CSS_CLASSNAME_PATTERN.test(newClass) ) {
          console.log('Invalid CSS ClassName: ', newClass);
          throw "Invalid CSS classname";
        }
        this.classes[newClass] = true;
        this.element_.classList.add(newClass);
      }
    },

    function slotAttr_(key, value) {
      /* Set an attribute based off of a dynamic Value. */
      var self = this;
      var l = function() { self.setAttribute(key, value.get()); };
      this.onDetach(value.sub(l));
      l();
    },

    function slotStyle_(key, v) {
      /* Set a CSS style based off of a dynamic Value. */
      var self = this;
      var l = function(value) { self.style_(key, v.get()); };
      this.onDetach(v.sub(l));
      l();
    },

    function style_(key, value) {
      /* Set a CSS style based off of a literal value. */
      this.css[key] = value;
      this.element_.style[key] = value;
      return this;
    },

    function addEventListener_(topic, listener, opt_args) {
      this.element_.addEventListener(topic, listener, opt_args || false);
    },

    function removeEventListener_(topic, listener) {
      var el = this.el_();
      el && el.removeEventListener(topic, listener);
    }
  ],

  listeners: [
    {
      name: 'onKeyboardShortcut',
      documentation: `
          Automatic mapping of keyboard events to $$DOC{ref:'Action'} trigger.
          To handle keyboard shortcuts, create and attach $$DOC{ref:'Action',usePlural:true}
          to your $$DOC{ref:'foam.ui.View'}.
      `,
      code: function(evt) {
        if ( evt.type === 'keydown' && ! this.KEYPRESS_CODES[evt.which] ) return;
        var action = this.keyMap_[this.evtToCharCode(evt)];
        if ( action ) {
          action();
          evt.preventDefault();
          evt.stopPropagation();
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'U2Context',

  documentation: 'Context which includes U2 functionality. Replaces foam.__context__.',

  exports: [
    'E',
    'registerElement',
    'elementForName'
  ],

  properties: [
    {
      name: 'elementMap',
      documentation: 'Map of registered Elements.',
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      // A Method which has the call-site context added as the first arg
      // when exported.
      class: 'foam.core.ContextMethod',
      name: 'E',
      code: function E(ctx, opt_nodeName) {
        var nodeName = (opt_nodeName || 'div').toLowerCase();

        // Check if a class has been registered for the specified nodeName
        return (ctx.elementForName(nodeName) || foam.u2.Element).
          create({nodeName: nodeName}, ctx);
      }
    },

    function registerElement(elClass, opt_elName) {
      /* Register a View class against an abstract node name. */
      var key = opt_elName || elClass.name;
      this.elementMap[key.toUpperCase()] = elClass;
    },

    function elementForName(nodeName) {
      /* Find an Element Class for the specified node name. */
      return this.elementMap[nodeName];
    }
  ]
});


foam.SCRIPT({
  package: 'foam.u2',
  name: 'U2ContextScript',

  requires: [ 'foam.u2.U2Context' ],
  flags: ['web'],

  code: function() {
    foam.__context__ = foam.u2.U2Context.create().__subContext__;
  }
});

/*
foam.CLASS({
  package: 'foam.u2',
  name: 'FObjectToERefinement',
  refines: 'foam.core.FObject',
  methods: [
    function toE(args, X) {
      return foam.u2.ViewSpec.createView(
        { class: 'foam.u2.DetailView', showActions: true, data: this },
        args, this, X);
    }
  ]
});
*/


foam.CLASS({
  package: 'foam.u2',
  name: 'PropertyViewRefinements',
  refines: 'foam.core.Property',

  requires: [
    'foam.u2.TextField'
  ],

  properties: [
    {
      // If true, this property is treated as a psedo-U2 attribute.
      name: 'attribute',
      value: false
    },
    {
      class: 'String',
      name: 'placeholder'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      value: { class: 'foam.u2.TextField' }
    },
    {
      name: 'visibility',
      adapt: function(o, n) { if ( foam.Object.isInstance(n) ) return foam.u2.DisplayMode.create(n); return foam.String.isInstance(n) ? foam.u2.DisplayMode[n] : n; },
      documentation: 'Exists for backwards compatability. You should set createVisibility, updateVisibility, or readVisibility instead. If this property is set, it will override the other three.'
    },
    {
      name: 'createVisibility',
      adapt: function(o, n) { if ( foam.Object.isInstance(n) ) return foam.u2.DisplayMode.create(n); return foam.String.isInstance(n) ? foam.u2.DisplayMode[n] : n; },
      documentation: 'The display mode for this property when the controller mode is CREATE.',
      factory: function() { return foam.u2.DisplayMode.RW; }
    },
    {
      name: 'readVisibility',
      adapt: function(o, n) { if ( foam.Object.isInstance(n) ) return foam.u2.DisplayMode.create(n); return foam.String.isInstance(n) ? foam.u2.DisplayMode[n] : n; },
      documentation: 'The display mode for this property when the controller mode is VIEW.',
      factory: function() { return foam.u2.DisplayMode.RO; }
    },
    {
      name: 'updateVisibility',
      adapt: function(o, n) { if ( foam.Object.isInstance(n) ) return foam.u2.DisplayMode.create(n); return foam.String.isInstance(n) ? foam.u2.DisplayMode[n] : n; },
      documentation: 'The display mode for this property when the controller mode is EDIT.',
      factory: function() { return foam.u2.DisplayMode.RW; }
    },
    {
      class: 'Boolean',
      name: 'validationTextVisible',
      documentation: "If true, validation text will be displayed below the input when it's in an invalid state.",
      value: true
    },
    {
      class: 'Boolean',
      name: 'validationStyleEnabled',
      documentation: 'If true, inputs will be styled when they are in an invalid state.',
      value: true
    },
    {
      class: 'Int',
      name: 'order',
      documentation: `
        The order to render the property in if rendering multiple properties.
      `,
      value: Number.MAX_SAFE_INTEGER
    },
    {
      class: 'Boolean',
      name: 'onKey'
    }
  ],

  methods: [
    function toE(args, X) {
      var e = foam.u2.ViewSpec.createView(this.view, args, this, X);

      if ( X.data$ && ! ( args && ( args.data || args.data$ ) ) ) {
        e.data$ = X.data$.dot(this.name);
      }

      e.fromProperty && e.fromProperty(this);

      // e could be a Slot, so check if addClass exists
      e.addClass && e.addClass('property-' + this.name);

      return e;
    },

    function combineControllerModeAndVisibility_(data$, controllerMode$) {
      /**
        Create a VisibilitySlot which combines controllerMode and the mode specific visibility.
        Is used in createVisibilityFor(), which also combines permissions.
      **/

      const DisplayMode = foam.u2.DisplayMode;

      return foam.core.ProxySlot.create({
        delegate$: controllerMode$.map(controllerMode => {
          var visibility = controllerMode.getVisibilityValue(this);

          // KGR: I'm not sure how this happens, but it does.
          // TODO: find out how/where.
          if ( foam.String.isInstance(visibility) )
            visibility = foam.u2.DisplayMode[visibility];

          if ( DisplayMode.isInstance(visibility) )
            return foam.core.ConstantSlot.create({value: visibility});

          if ( foam.Function.isInstance(visibility) ) {
            var slot = foam.core.ExpressionSlot.create({
              obj$: data$,
              // Disallow RW DisplayMode when in View Controller Mode
              code: visibility
            });

            // Call slot.args so its expression extracts args from visibility function
            slot.args;

            slot.code = function() {
              return controllerMode.restrictDisplayMode(visibility.apply(this, arguments));
            };

            return slot;
          }

          if ( foam.core.Slot.isInstance(visibility) ) return visibility;

          throw new Error('Property.visibility must be set to one of the following: (1) a value of DisplayMode, (2) a function that returns a value of DisplayMode, or (3) a slot whose value is a value of DisplayMode. Property ' + this.name + ' was set to ' + visibility + ' instead.');
        })
      });
    },

    function createVisibilityFor(data$, controllerMode$) {
      /**
       * Return a slot of DisplayMode based on:
       *   * visibility
       *   * createVisibility
       *   * updateVisibility
       *   * readVisibility
       *   * readPermissionRequired
       *   * writePermissionRequired
       *
       * 'this' is a Property
       */
//      controllerMode$.sub(() => { debugger; /* I don't think this ever happens. KGR */ });

      var vis = this.combineControllerModeAndVisibility_(data$, controllerMode$)

      if ( ! this.readPermissionRequired && ! this.writePermissionRequired ) return vis;

      const DisplayMode = foam.u2.DisplayMode;

      var perm = data$.map((data) => {
        if ( ! data || ! data.__subContext__.auth ) return DisplayMode.HIDDEN;
        var auth     = data.__subContext__.auth;
        var propName = this.name.toLowerCase();
        var clsName  = data.cls_.name.toLowerCase();
        var canRead  = this.readPermissionRequired === false;

        return auth.check(null, `${clsName}.rw.${propName}`)
          .then(function(rw) {
            if ( rw      ) return DisplayMode.RW;
            if ( canRead ) return DisplayMode.RO;
            return auth.check(null, `${clsName}.ro.${propName}`)
              .then((ro) => ro ? DisplayMode.RO : DisplayMode.HIDDEN);
          });
      });

      return foam.core.ArraySlot.create({slots: [vis, perm]}).map((arr) => {
        // The || HIDDEN is required because slot.map() above which returns
        // a promise will generate an intermediate null value.
        return arr[0].restrictDisplayMode(arr[1] || DisplayMode.HIDDEN)
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'StringDisplayWidthRefinement',
  refines: 'foam.core.String',
  requires: [ 'foam.u2.view.StringView' ],
  properties: [
    {
      class: 'Int',
      name: 'displayWidth',
      expression: function(width) { return width; }
    },
    [ 'view', { class: 'foam.u2.view.StringView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'FormattedStringViewRefinement',
  refines: 'foam.core.FormattedString',
  requires: [ 'foam.u2.FormattedTextField' ],
  properties: [
    {
      name: 'view',
      factory: function() {
        return {
          class: 'foam.u2.FormattedTextField',
          formatter: this.formatter,
          returnFormatted: false
        };
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ArrayViewRefinement',
  refines: 'foam.core.Array',
  requires: [ 'foam.u2.view.ArrayView' ],
  properties: [
    [ 'view', { class: 'foam.u2.view.ArrayView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'StringArrayViewRefinement',
  refines: 'foam.core.StringArray',
  requires: [ 'foam.u2.view.StringArrayView' ],
  properties: [
    [ 'view', { class: 'foam.u2.view.StringArrayView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'DateViewRefinement',
  refines: 'foam.core.Date',
  requires: [ 'foam.u2.view.DateView' ],
  properties: [
    [ 'view', { class: 'foam.u2.view.DateView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'DateTimeViewRefinement',
  refines: 'foam.core.DateTime',
  requires: [ 'foam.u2.view.DateTimeView' ],
  properties: [
    [ 'view', { class: 'foam.u2.view.DateTimeView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TimeViewRefinement',
  refines: 'foam.core.Time',
  requires: [ 'foam.u2.view.TimeView' ],
  properties: [
    [ 'view', { class: 'foam.u2.view.TimeView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'FloatViewRefinement',
  refines: 'foam.core.Float',
  requires: [ 'foam.u2.view.FloatView' ],
  properties: [
    [ 'displayWidth', 12 ],
    [ 'view', { class: 'foam.u2.view.FloatView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'IntViewRefinement',
  refines: 'foam.core.Int',
  requires: [ 'foam.u2.view.IntView' ],
  properties: [
    [ 'displayWidth', 10 ],
    [ 'view', { class: 'foam.u2.view.IntView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'UnitValueViewRefinement',
  refines: 'foam.core.UnitValue',
  requires: [ 'foam.u2.view.CurrencyView' ],
  properties: [
    [ 'displayWidth', 15 ],
    [ 'view', { class: 'foam.u2.view.CurrencyView', onKey: false } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'BooleanViewRefinement',
  refines: 'foam.core.Boolean',
  requires: [ 'foam.u2.CheckBox' ],
  properties: [
    {
      name: 'view',
      expression: function(label, labelFormatter) {
        return {
          class: 'foam.u2.CheckBox',
          label: this.help,
          labelFormatter: labelFormatter
        };
      }
    },
    {
      name: 'labelFormatter'
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ColorViewRefinement',
  refines: 'foam.core.Color',

  requires: [
    'foam.u2.MultiView',
    'foam.u2.TextField',
    'foam.u2.view.ColorPicker',
    'foam.u2.view.ModeAltView',
    'foam.u2.view.ReadColorView'
  ],

  properties: [
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.ModeAltView',
        readView: { class: 'foam.u2.view.ReadColorView' },
        writeView: {
          class: 'foam.u2.MultiView',
          views: [
            { class: 'foam.u2.TextField' },
            { class: 'foam.u2.view.ColorPicker', onKey: true },
            { class: 'foam.u2.view.ReadColorView' }
          ]
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'FObjectPropertyViewRefinement',
  refines: 'foam.core.FObjectProperty',

  requires: [ 'foam.u2.view.FObjectPropertyView' ],

  properties: [
    {
      name: 'view',
      value: { class: 'foam.u2.view.FObjectPropertyView' },
    },
    {
      name: 'validationTextVisible',
      documentation: `
        Hide FObjectProperty validation because their inner view should provide its
        own validation so having it on the outer view and the inner view is redundant
        and jarring.
      `,
      value: false
    },
    {
      name: 'validationStyleEnabled',
      value: false
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'FObjectArrayViewRefinement',
  refines: 'foam.core.FObjectArray',

  properties: [
    {
      name: 'view',
      expression: function(of) {
        return {
          class: 'foam.u2.view.TitledArrayView',
          of: of
        };
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'MapViewRefinement',
  refines: 'foam.core.Map',

  properties: [
    {
      name: 'view',
      value: { class: 'foam.u2.view.MapView' },
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ClassViewRefinement',
  refines: 'foam.core.Class',

  properties: [
    [ 'view', { class: 'foam.u2.ClassView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ReferenceViewRefinement',
  refines: 'foam.core.Reference',

  requires: [ 'foam.u2.view.ReferencePropertyView' ],

  properties: [
    [ 'view', { class: 'foam.u2.view.ReferencePropertyView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'EnumViewRefinement',
  refines: 'foam.core.Enum',

  requires: [ 'foam.u2.view.EnumView' ],

  properties: [
    [ 'view', { class: 'foam.u2.view.EnumView' } ],
    [ 'tableCellView', function(obj) { return this.get(obj).label; } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ObjectViewRefinement',
  refines: 'foam.core.Object',

  requires: [ 'foam.u2.view.AnyView' ],

  properties: [
    [ 'view', { class: 'foam.u2.view.AnyView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'CodeViewRefinement',
  refines: 'foam.core.Code',

  requires: [ 'foam.u2.view.CodeView' ],

  properties: [
    [ 'view', { class: 'foam.u2.view.CodeView' } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'DurationViewRefinement',
  refines: 'foam.core.Duration',

  requires: [
    'foam.u2.view.IntView',
    'foam.u2.view.TableCellFormatterReadView'
  ],

  properties: [
    [ 'view', {
      class: 'foam.u2.view.IntView',
      readView: { class: 'foam.u2.view.TableCellFormatterReadView' }
    } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'PredicatePropertyRefinement',

  refines: 'foam.mlang.predicate.PredicateProperty',

  requires: [
    'foam.u2.view.FObjectPropertyView',
    'foam.u2.view.FObjectView'
  ],
  properties: [
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.FObjectPropertyView',
        writeView: {
          class: 'foam.u2.view.FObjectView',
          of: 'foam.mlang.predicate.Predicate'
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ExprPropertyRefinement',

  refines: 'foam.mlang.ExprProperty',

  requires: [
    'foam.u2.view.FObjectPropertyView',
    'foam.u2.view.FObjectView'
  ],

  properties: [
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.FObjectPropertyView',
        writeView: {
          class: 'foam.u2.view.FObjectView',
          of: 'foam.mlang.Expr'
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'PasswordPropertyRefinement',
  refines: 'foam.core.Password',

  requires: [
    'foam.u2.view.PasswordView'
  ],

  properties: [
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'View',
  extends: 'foam.u2.Element',

  documentation: `
    A View is an Element used to display data.
    // TODO: Should the following be properties?

    {
      type: 'Boolean',
      name: 'showValidation',
      documentation: 'Set to false if you want to ignore any ' +
          '$$DOC{ref:"Property.validate"} calls. On by default.',
      defaultValue: true
    },
    {
      type: 'String',
      name: 'validationError_',
      documentation: 'The actual error message. Null or the empty string ' +
          'when there is no error.',
    }
  `,

  exports: [ 'data' ],

  properties: [
    {
      name: 'data',
      attribute: true
    },
    // {
    //   class: 'String',
    //   name: 'error_'
    // },
    {
      class: 'Enum',
      of: 'foam.u2.DisplayMode',
      name: 'mode',
      attribute: true,
      postSet: function(_, mode) { this.updateMode_(mode); },
      expression: function(controllerMode) {
        return controllerMode === foam.u2.ControllerMode.VIEW ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.RW ;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.updateMode_(this.mode);
      // this.enableClass('error', this.error_$);
      this.setAttribute('title', this.error_$);
    },

    function updateMode_() {
      // Template method, to be implemented in sub-models
    },

    function fromProperty(p) {
      this.attr('name', p.name);
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Controller',
  extends: 'foam.u2.Element',

  documentation: 'A Controller is an Element which exports itself as "data".',

  exports: [ 'as data' ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ActionViewRefinement',
  refines: 'foam.core.Action',

  requires: [
    'foam.u2.ActionView'
  ],

  properties: [
    {
      name: 'view',
      value: function(args, X) {
        return { class: 'foam.u2.ActionView', action: this };
      }
    }
  ],

  methods: [
    function toE(args, X) {
      var view = foam.u2.ViewSpec.createView(this.view, args, this, X);

      if ( X.data$ && ! ( args && ( args.data || args.data$ ) ) ) {
        view.data$ = X.data$;
      }

      return view;
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'TableColumns',

  documentation: 'Axiom for storing Table Columns information in Class. Unlike most Axioms, doesn\'t modify the Class, but is just used to store information.',

  properties: [
    [ 'name', 'tableColumns' ],
    'columns'
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'SearchColumns',

  documentation: 'Axiom for storing Table Search Columns information in Class. Unlike most Axioms, doesn\'t modify the Class, but is just used to store information.',

  properties: [
    [ 'name', 'searchColumns' ],
    'columns'
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ModelU2Refinements',
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'String',
      name: 'css',
      postSet: function(_, code) {
        var css = foam.u2.CSS.create({code: code});
        css.name = css.name + '-' + this.id;
        this.axioms_.push(css);
      }
    },
    {
      class: 'Boolean',
      name: 'inheritCSS',
      value: true
    },
    {
      name: 'tableColumns',
      postSet: function(_, cs) {
        this.axioms_.push(foam.u2.TableColumns.create({columns: cs}));
      }
    },
    {
      name: 'searchColumns',
      postSet: function(_, cs) {
        this.axioms_.push(foam.u2.SearchColumns.create({columns: cs}));
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'HTMLView',
  extends: 'foam.u2.Element',

  documentation: 'View for safely displaying HTML content.',

  css: '^ { padding: 6px 0; }',

  properties: [
    {
      name: 'data',
      attribute: true
    }
  ],

  methods: [
    function render() {
      this.addClass();
      this.update();
      this.onDetach(this.data$.sub(this.update));
    }
  ],

  listeners: [
    {
      name: 'update',
      isFramed: true,
      code: function() {
        // TODO: add validation
        this.element_.innerHTML = this.data;
      }
    }
  ]
});
