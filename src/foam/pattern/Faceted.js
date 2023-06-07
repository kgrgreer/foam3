/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
  A Faceted Axiom, when added to a Class, makes it implement
  the Facet-Manager Pattern, meaning that calls to create() can
  be intercepted and return a special Facet class depending on the
  value of the 'of' create argument.

  Ex.:
  foam.CLASS({
    name: 'View',
    axioms: [ foam.pattern.Faceted.create() ],
    properties: [ 'of' ],
    methods: [ function view() { return 'default' } ]
  });

  foam.CLASS({name: 'A'});
  foam.CLASS({name: 'B'});
  foam.CLASS({name: 'C'});
  foam.CLASS({name: 'BView', extends: 'View', methods: [function view() { return 'BView'; }]});
  foam.CLASS({name: 'CView', extends: 'View', methods: [function view() { return 'CView'; }]});

  console.log(View.create({of: A}));
  console.log(View.create({of: B}));
  console.log(View.create({of: C}));
*/
// FUTURE: add createOriginal() (or similar) method.
foam.CLASS({
  package: 'foam.pattern',
  name: 'Faceted',

  properties: [
    [ 'name', 'foam.pattern.Faceted' ],
    {
      class: 'Boolean',
      name: 'inherit',
      documentation: `
        Setting this to true will enable climbing the inheritance tree when
        searching for an implementation. This works well with views that
        display a subset of an object's properties such as CitationView or
        RowView as it may result in a generalized representation with missing
        information.
      `
    },
    {
      class: 'String',
      name: 'ofProperty',
      value: 'of'
    }
  ],

  methods: [
    function installInClass(cls) {
      const axiom = this;
      var oldCreate = cls.create;

      cls.getFacetOf = function(of, X) {
        if ( ! of ) return this;
        X = foam.core.FObject.isInstance(X) ? X.__context__ : X || foam.__context__;

        var name;
        var pkg;
        if ( foam.String.isInstance(of) ) {
          if ( of.indexOf('.') != -1 ) {
            name = of.substring(of.lastIndexOf('.') + 1);
            pkg  = of.substring(0, of.lastIndexOf('.'))
          } else {
            name = of;
            pkg  = this.package;
          }
        } else {
          name = of.name;
          pkg  = of.package;
        }

        var id = ( pkg ? pkg + '.' : '' ) + name + this.name;

        let facet = X.maybeLookup(id) || of[this.name] || this;
        if ( axiom.inherit && facet === this ) {
          const ofCls = foam.String.isInstance(of) ? X.maybeLookup(of) : of;
          if ( ! ofCls || ! ofCls.model_.extends ) return facet;
          if ( ofCls == foam.core.FObject ) return facet;
          return this.getFacetOf(X.maybeLookup(ofCls.model_.extends)) || facet;
        }
        return facet;
      };

      // ignoreFacets is set to true when called to prevent a second-level
      // of facet checking
      cls.create = function(args, X, ignoreFacets) {
        if ( ! ignoreFacets ) {
          // If class does not have an 'of', then check for 'data.of' instead. Also check data$ incase data doesnt exist
          var of;
          if ( args ) {
            of = args[axiom.ofProperty] || ( args.data && ( args.data[axiom.ofProperty] || args.data.cls_ ) ) ;
            if ( ! of ) {
              let data = args.data$?.get();
              of = data?.[axiom.ofProperty] || data?.cls_;
            }
          }
          var facetCls = this.getFacetOf(of, X);

          if ( facetCls !== this ) return facetCls.create(args, X, true);
        }

        return oldCreate.apply(this, arguments);
      }
    }
  ]
});
