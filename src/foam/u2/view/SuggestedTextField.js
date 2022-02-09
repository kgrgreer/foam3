/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'foam.u2.view',
  name: 'SuggestedTextField',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.Autocompleter',
    'foam.u2.CitationView',
    'foam.u2.TextField'
  ],

  css: `
    ^suggestions {
      background-color: /*%WHITE%*/ #ffffff;
      border: 1px solid /*%GREY3%*/ #cbcfd4;
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
      color: /*%GREY1%*/ #5e6061;
      cursor: pointer;
      padding: 4px 8px;
    }
  `,

  messages: [
    { name: 'SUGGESTIONS_MSG', message: 'Suggestions' },
    { name: 'NO_SUGGESTIONS_MSG', message: 'No Suggestions' }
  ],

  properties: [
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
        return this.Autocompleter.create({dao: this.__subContext__[this.daoKey]})
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
      name: 'ctx'
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
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'filteredValues'
    },
    {
      class: 'String',
      name:'placeholder'
    },
    'inputFocused'
  ],

  methods: [
    function render() {
      var self = this;
      var id;
      this.SUPER();
      if ( this.autocompleter )
        this.autocompleter.partial$ = this.data$;

      this.onDetach(this.onload.sub(this.loaded));
      this
      .start(this.TextField, {
        data$: this.data$,
        onKey: true,
        placeholder$: this.placeholder$
      })
        .on('focus', () => {
          this.inputFocused = true;
        })
        .on('blur', () => {
          this.inputFocused = false;
        })
      .end()
      .add(this.slot(function(filteredValues, data, inputFocused) {
        if ( ! data || ! inputFocused ) return this.E();
        if ( ! filteredValues.length ) return this.E().addClass(this.myClass('suggestions')).add(this.emptyTitle)
        return this.E().addClass(this.myClass('suggestions')).add(this.title).forEach(this.filteredValues, function(obj) {
          this
           .start(self.rowView, { data: obj })
             .addClass(self.myClass('row'))
             .on('mousedown', function() {
               self.onSelect.call(self, obj, self.ctx)
             })
           .end()
        })
      }))
    }
  ],

  listeners: [
    {
      name: 'onUpdate',
      isFramed: true,
      code: function() {
        this.autocompleter.filteredDAO.select()
        .then((sink) => {
          this.filteredValues = sink.array;
        });
      }
    },
    function loaded() {
      this.onDetach(this.autocompleter.filteredDAO$proxy.sub(this.onUpdate));
    }
  ]
});
