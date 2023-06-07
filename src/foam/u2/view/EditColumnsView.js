/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EditColumnsView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DetailView',
    'foam.u2.view.ColumnConfigPropView',
    'foam.u2.view.SubColumnSelectConfig'
  ],
  imports: [
    'window'
  ],
  css: `
    ^drop-down-bg {
      position:         fixed;
      width:            100%;
      height:           100%;
      top:              0;
      left:             0;
      z-index:          100;
    }
    ^ .foam-u2-ActionView-closeButton {
      width: 24px;
      height: 35px;
      margin: 0;
      cursor: pointer;
      display: inline-block;
      float: right;
      outline: 0;
      border: none;
      background: transparent;
      box-shadow: none;
      padding-top: 15px;
      margin-right: 15px;
    }
    ^ .foam-u2-ActionView-closeButton:hover {
      outline: none;
      border: none;
      background: transparent;
    }
    ^container {
      align-items: flex-start;
      background-color: $white;
      border-radius: 5px;
      border: 1px solid $grey300;
      box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      max-width: clamp(300px, 20vw, 600px);
      padding: 16px 8px;
      position: fixed;
      right: 60px;
      top: 120px;
    }
  `,
  properties: [
    {
      name: 'selectColumnsExpanded',
      class: 'Boolean'
    },
    'parentId',
    'columnConfigPropView',
    'height'
  ],
  methods: [
    function closeDropDown(e) {
      e.stopPropagation();
      this.columnConfigPropView.onClose();
      this.selectColumnsExpanded = ! this.selectColumnsExpanded;
    },
    function render() {
      this.SUPER();
      var self = this;
      this.window.addEventListener('resize', this.resize);
      this.resize();
      this.onDetach(() => self.window.removeEventListener('resize', self.resize));
      this.start()
      .addClass(this.myClass())
        .show(this.selectColumnsExpanded$)
        .addClass(this.myClass('drop-down-bg'))
          .start({ class: 'foam.u2.view.ColumnConfigPropView', data: self.data }, { } ,this.columnConfigPropView$ )
            .addClass(this.myClass('container'))
            .style({
              'max-height': this.height$
            })
          .end()
      .on('click', this.closeDropDown.bind(this))
      .end();
    }
  ],
  listeners: [
    function resize() {
      this.height = this.window.innerHeight - 200 > 0 ? this.window.innerHeight - 200 + 'px' : this.window.innerHeight + 'px';
    }
  ],
  actions: [
    {
      name: 'closeButton',
      label: '',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        this.columnConfigPropView.onClose();
        this.selectColumnsExpanded = ! this.selectColumnsExpanded;
      }
    }
  ]
});
