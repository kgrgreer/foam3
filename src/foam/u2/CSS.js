/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
      documentation: 'True if the CSS contains a ^ which needs to be expanded.',
      expression: function(code) {
        return code.includes('^') || code.includes(foam.u2.Element.CSS_SELF) /* << */;
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
          X.installCSS(this.expandCSS(cls, this.code, X), cls.id);
        }
      } else {
        if ( ! installedStyles[this.$UID] ) {
          installedStyles[this.$UID] = true;
          X.installCSS(this.expandCSS(cls, this.code, X), cls.id);
        }
      }
    },

    function installInClass(cls) {
      // Install myself in this Window, if not already there.
      var oldCreate = cls.create;
      var axiom     = this;

      cls.create = function(args, opt_parent, faceted, opt_skipCSS) {
        var X = opt_parent ?
          ( opt_parent.__subContext__ || opt_parent.__context__ || opt_parent ) :
          foam.__context__;

        // Call through to the original create
        try {
          return oldCreate.call(this, args, X, faceted, opt_skipCSS || ! cls.model_.inheritCSS);
        } finally {
          if ( ! opt_skipCSS ) {
            // Install CSS if not already installed in this document for this cls
            axiom.maybeInstallInDocument(X, this);
          }
        }
      };
    },

    function expandCSS(cls, text, ctx) {
      if ( this.expands_ ) {
        /* Performs expansion of the ^ shorthand on the CSS. */
        // TODO(braden): Parse and validate the CSS.
        // TODO(braden): Add the automatic prefixing once we have the parser.
        var base = '.' + foam.String.cssClassize(cls.id);
        text = text.replace(/\^(.)/g, function(match, next) {
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

      // CSS Tokens should expand even if expands_ is false
      return foam.CSS.replaceTokens(text, cls, ctx);
    }
  ]
});
