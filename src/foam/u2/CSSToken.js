/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'CSSToken',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      name: 'value',
      preSet: function(o, d) {
        var f = ! d || foam.util.isPrimitive(d) || foam.Function.isInstance(d);
        if ( ! f ) {
          this.__context__.warn('Trying to set invalid token value:' + d);
          return o;
        }
        return d;
      }
    },
    {
      name: 'fallback',
      preSet: function(o, d) {
        var f = ! d || foam.util.isPrimitive(d);
        if ( ! f ) {
          this.__context__.warn('Set Token fallback to non-primitive:' + d);
          return o;
        }
        return d;
      }
    },
    'sourceCls_'
  ],

  methods: [
    function toSummary() {
      return `name: ${this.name}, value: ${this.value}, fallback: ${this.fallback}`;
    },
    function installInClass(cls) {
      var axiom = this;
      axiom.sourceCls_ = cls;
      Object.defineProperty(
        cls,
        foam.String.constantize(this.name),
        {
          get: function() { return axiom; }
        }
      );
    },
    function installInProto(proto) {
      this.installInClass(proto);
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'CSSTokenRefinement',
  refines: 'foam.core.Model',

  properties: [
    {
      name: 'cssTokens',
      class: 'AxiomArray',
      of: 'foam.u2.CSSToken',
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        if ( ! Array.isArray(a) ) {
          var cs = [];
          for ( var key in a ) {
            cs.push(foam.u2.CSSToken.create({name: key, value: a[key]}));
          }
          return cs;
        }
        return foam.core.AxiomArray.ADAPT.value.call(this, _, a, prop);
      },
      adaptArrayElement: function(o, prop) {
        if ( Array.isArray(o) ) {
          return foam.u2.CSSToken.create({ name: o[0], value: o[1] });
        }

        return foam.core.AxiomArray.ADAPT_ARRAY_ELEMENT.value.call(this, o, prop);
      }
    }
  ]
});


