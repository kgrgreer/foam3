/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'CitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create({inherit: true})
  ],

  css: `
    ^row {
      font-size: 1.2rem;
    }

    ^row:not(:read-only) {
      background: $white;
      padding: 8px 16px;
      color: /*%BALCK%*/ #424242;
    }

    ^row:hover:not(:read-only) {
      background: $grey50;
      cursor: pointer;
    }
  `,

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'summary'
    }
  ],

  listeners: [
    {
      name: 'updateSummary',
      isFramed: true,
      on: [
        'data.propertyChange',
        'this.propertyChange.data'//TODO check if we can delete it.
      ],
      code: async function() {
        let newSummary;

        if ( this.data ) {
          var summary = this.getSummary(this.data);

          newSummary = summary instanceof Promise
            ? await summary
            : summary;
        } else {
          newSummary = undefined;
        }

        this.summary = newSummary;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.updateSummary();
      this
        .addClass(this.myClass('row'))
        .add(this.summary$);
    },

    function updateMode_(mode) {
      this.setAttribute('readonly', mode === foam.u2.DisplayMode.RO);
      this.setAttribute('disabled', mode === foam.u2.DisplayMode.DISABLED);
    },

    function getSummary(data) {
      return data.toSummary?.();
    }
  ]
});
