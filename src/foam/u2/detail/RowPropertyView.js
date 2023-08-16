/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'RowPropertyView',
  extends: 'foam.u2.View',

  documentation: `
    View a property's columnLabel and value in a single row. The table cell formatter
    will be used to render the value.
  `,

  imports: ['objData'],
  css: `
    ^ {
      display: flex;
      justify-content: space-between;
      gap: 2rem;
    }
    ^label{
      flex-basis: 50%;
    }
    ^body{
      flex-shrink: 2;
    }
    ^ > .note {
      white-space: pre;
      padding: 2rem 0rem;
      padding-left: 6rem;
    }
  `,

  properties: [
    'prop'
  ],

  methods: [
    function render() {
      const self = this;
      this
        .addClass()
        .start()
          .add(this.prop.columnLabel).show(this.prop.columnLabel)
          .addClass(this.myClass('label'))
        .end()
        .add(this.slot(function (data, objData) {
          const el = this.E();
          const prop = self.prop;
          prop.tableCellFormatter.format(
            el,
            prop.f ? prop.f(objData) : null,
            objData,
            prop
          );
          return el;
        })).addClass(this.myClass('body'));
    }
  ]
});
