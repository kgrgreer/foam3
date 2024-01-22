/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'RowPropertyView',
  extends: 'foam.u2.PropertyBorder',
  mixins: ['foam.u2.layout.ContainerWidth'],

  documentation: `
    View a property's columnLabel and value in a single row. The table cell formatter
    will be used to render the value.
  `,

  imports: ['objData'],
  css: `
    ^row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 2rem;
      align-items: center;
    }
    ^label{
      display: inherit;
      flex-basis: 50%;
      font-weight: normal;
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
      const sup = this.SUPER;
      this.initContainerWidth();
      this.add(this.dynamic(function(containerWidth) {
        let isRow = containerWidth?.minWidth <= foam.u2.layout.DisplayWidth.XS.minWidth;
        this.enableClass(self.myClass('row'), ! isRow);
        if ( isRow ) {
          sup.call(self);
        } else {
          this
          .start()
            .add(self.prop.columnLabel).show(self.prop.columnLabel)
            .addClass(self.myClass('label'))
          .end()
          .add(this.slot(function (data, objData) {
            const el = this.E();
            const prop = self.prop;
            prop.tableCellFormatter.format(
              el,
              prop.f ? prop.f(objData || data) : null,
              objData || data,
              prop
            );
            return el;
          })).addClass(this.myClass('body'));
        }
      }));
    }
  ]
});
