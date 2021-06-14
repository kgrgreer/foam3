/*
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.dialog',
  name: 'ModalStyles',

  values: [
    {
      name: 'DEFAULT',
      color: '/*%WHITE%*/ #FFFFFF'
    },
    {
      name: 'DESTRUCTIVE',
      color: '/*%DESTRUCTIVE3%*/ #D9170E'
    },
    {
      name: 'WARN',
      color: '/*%WARNING3%*/ #EEDC00'
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'StyledModal',
  extends: 'foam.u2.dialog.Popup',
  documentation: `
    This view is a simple styled modal with a title and ability to add content/strings and actions
  `,

  imports: ['returnExpandedCSS', 'theme?'],

  requires: ['foam.u2.dialog.ModalStyles', 'foam.u2.layout.Rows'],

  css: `
    ^top{
      position: absolute;
      top: 2vh;
    }
    ^colorBar{
      border: 1px solid;
      border-bottom: 0px;
      border-radius: 3px 3px 0 0;
      box-sizing: border-box;
      height: 8px;
      width: 100%;
      z-index: 4;
    }
    ^inner {
      background-color: /*%WHITE%*/ white;
      border: 1px solid /*%GREY4%*/ #DADDE2;
      border-radius: 0 0 3px 3px;
      border-top: none;
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);      
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 24px;
      padding-bottom: 0px; 
    }
    ^modal-body{
      height: 100%;
      overflow: auto;
      position: relative;
    }
    ^title{
      margin-right: 40px;
      padding-bottom: 16px;
    }
    ^actionBar {
      display: flex;
      justify-content: flex-end;
      padding: 16px 0px;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'maxHeight',
      value: 65
    },
    {
      class: 'Int',
      name: 'maxWidth',
      value: 45
    },
    {
      class: 'Enum',
      of: 'foam.u2.dialog.ModalStyles',
      name: 'modalStyle',
      value: 'DEFAULT',
      documentation: 'Setting modal styles adds a coloured bar at the top of the modal'
    },
    {
      name: 'isStyled',
      value: true,
      documentation: 'Can be used to turn off all styling for modal container'
    },
    {
      name: 'title',
      class: 'String'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'actionArray',
      documentation: 'Can be used to specify additional actions. Designed to be used when there are no primary/secondaryActions'
    },
    {
      class: 'Boolean',
      name: 'isTop',
      value: false,
      documentation: 'Positions the modal to the top of the screen'
    }
  ],

  methods: [
    function init() {
      var bgColor = this.returnExpandedCSS(this.modalStyle.color);
      this
        .addClass(this.myClass())
        .on('keydown', this.onKeyDown)
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.closeable ? this.close : null)
        .end()
        .start(this.Rows)
          .enableClass(this.myClass('top'), this.isTop$)
          .start()
              .enableClass(this.myClass('colorBar'), this.isStyled$)
              .style({ 'background-color': bgColor, 'border-color': this.modalStyle != 'DEFAULT' ? bgColor : this.returnExpandedCSS('/*%GREY4%*/ #DADDE2')})
          .end()
          .start()
            .style({ 'max-height': this.maxHeight+'vh', 'max-width': this.maxWidth+'vw' })
            .enableClass(this.myClass('inner'), this.isStyled$)
            .startContext({ data: this })
              .start(this.CLOSE_MODAL, { buttonStyle: 'TERTIARY' }).show(this.closeable$)
                .addClass(this.myClass('X'))
              .end()
            .endContext()
            .start().addClasses(['h400', this.myClass('title')]).add(this.title).end()
            .start()
              .addClass(this.myClass('modal-body'))
              .add(this.addBody())
            .end()
            .start()
              .addClass(this.myClass('actionBar'))
              .add(this.addActions())
            .end()
          .end()
        .end();
    },
    function addBody() {
      return this.tag('', null, this.content$);
    },
    function addActions() {
      var actions = this.E().startContext({ data$: this.data$ });
      for ( action of this.actionArray ) {
        actions.tag(action);
      }
      return actions.endContext();
    }
  ]

});
