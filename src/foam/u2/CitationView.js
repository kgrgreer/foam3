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
    foam.pattern.Faceted.create()
  ],

  css: `
    ^row {
      background-color: /*%WHITE%*/;
      font-size: 1.2rem;
      padding: 8px 16px;
      color: #424242;
    }

    ^rw:hover {
      background: #f4f4f9;
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

  reactions: [
    ['', 'propertyChange.data', 'updateSummary'],
    ['data', 'propertyChange', 'updateSummary']
  ],

  listeners: [
    {
      name: 'updateSummary',
      isFramed: true,
      code: function() {
        this.summary = this.data && this.data.toSummary ? this.data.toSummary() : undefined;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.updateSummary();
      this
        .addClass(this.myClass('row'))
        .enableClass(this.myClass('rw'), this.mode$.map(m => m === foam.u2.DisplayMode.RW))
        .add(this.summary$);
    }
  ]
});
