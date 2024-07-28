/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'SuggestedTextField',
  extends: 'foam.u2.View',

  documentation: 'recommends values based on search characters and the provided autocompleter. Look at foam.u2.autocompleter for implementation of the search predicate.',

  requires: [
    'foam.u2.Autocompleter',
    'foam.u2.CitationView',
    'foam.u2.TextField'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'onRowSelect?'
  ],

  css: `
    ^ {
      position: relative;
    }
    ^suggestions {
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1);
      background-color: $white;
      border: 1px solid $grey400;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      height: auto;
      margin-top: 2px;
      max-height: 14em;
      overflow: auto;
      padding: 6px;
      position: absolute;
      width: 100%;
      z-index: 100;
    }
    ^suggestions > * + * {
      margin-top: 4px;
    }
    ^row {
      color: $grey700;
      cursor: pointer;
      padding: 4px 8px;
    }
  `,

  messages: [
    { name: 'SUGGESTIONS_MSG',    message: 'Suggestions' },
    { name: 'NO_SUGGESTIONS_MSG', message: 'No Suggestions' },
    { name: 'MORE_SUGGESTIONS',   message: 'Refine search to see more results' }
  ],

  properties: [
    'prop',
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Autocompleter',
      name: 'autocompleter',
      factory: function() {
        if ( ! this.daoKey ) console.error('No daokey');
        return this.Autocompleter.create({ dao: this.__subContext__[this.daoKey] })
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'rowView',
      value: {
        class: 'foam.u2.CitationView'
      }
    },
    {
      name: 'onSelect',
      value: function(obj) {
        this.data = obj.toSummary();
      }
    },
    {
      class: 'String',
      name: 'title',
      factory: function() {
        return this.SUGGESTIONS_MSG;
      }
    },
    {
      class: 'String',
      name: 'emptyTitle',
      factory: function() {
        return this.NO_SUGGESTIONS_MSG;
      }
    },
    {
      class: 'Array',
      name: 'filteredValues'
    },
    {
      class: 'String',
      name: 'placeholder'
    },
    {
      class: 'Boolean',
      name: 'suggestOnFocus'
    },
    {
      class: 'Int',
      name: 'suggestionsLimit',
      value: 50,
      documentation: 'Limits the number of suggestions displayed'
    },
    {
      class: 'Boolean',
      name: 'refineInput'
    },
    'inputFocused'
  ],

  methods: [
    function render() {
      var self = this;
      this.SUPER();
      var callFromProperty = function() {
        self.prop && this.fromProperty && this.fromProperty(self.prop);
      };
      if ( this.autocompleter )
        this.autocompleter.partial$ = this.data$;

      this.onDetach(this.onload.sub(this.loaded));
      this
      .addClass()
      .start(this.TextField, {
        data$: this.data$,
        onKey: true,
        placeholder$: this.placeholder$,
        autocomplete: false
      })
        .call(callFromProperty)
        .on('focus', () => {
          this.inputFocused = true;
        })
        .on('blur', () => {
          this.inputFocused = false;
        })
      .end()
      .add(this.slot(this.populate));
    },
    function populate(filteredValues, data, inputFocused, suggestOnFocus) {
      const self = this;
      if ( ( ! data && ! suggestOnFocus ) || ! inputFocused ) return this.E();
      if ( ! filteredValues.length ) return this.E().addClass(this.myClass('suggestions')).add(this.emptyTitle);
      return this.E().addClass(this.myClass('suggestions')).add(this.title).forEach(this.filteredValues, function(obj) {
        this
          .start(self.rowView, { data: obj })
            .addClass(self.myClass('row'))
            .on('mousedown', function(e) {
             // using mousedown not click since mousedown is fired before blur is fired so we can intercept rowClick
             // otherwise when using click the blur gets fired first and the row listener is never called
               self.onRowSelect ? self.onRowSelect(obj) : self.onSelect.call(self, obj);
               self.inputFocused = false;

               e.preventDefault();
             })
          .end();
      }).add(this.refineInput$.map(v => v ? self.MORE_SUGGESTIONS : ""));
    },
    function fromProperty(prop) {
      this.prop = prop;
    }
  ],

  listeners: [
    {
      name: 'onUpdate',
      isFramed: true,
      code: function() {
        const self = this;
        if ( this.suggestionsLimit > 0 ) {
          this.autocompleter.filteredDAO.limit(this.suggestionsLimit).select()
          .then((sink) => {
            this.filteredValues = sink.array;
          });
          // required to check if more elements are available to render
          this.autocompleter.filteredDAO.limit(this.suggestionsLimit+1).select(this.Count.create()).then( count => {
            self.refineInput = count.value > self.suggestionsLimit;
          });
        } else {
          this.autocompleter.filteredDAO.select()
          .then((sink) => {
            this.filteredValues = sink.array;
          });
        }
      }
    },
    function loaded() {
      this.onDetach(this.autocompleter.filteredDAO$proxy.sub(this.onUpdate));
      this.onUpdate();
    }
  ]
});
