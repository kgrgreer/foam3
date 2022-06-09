/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'ApplicationPopup',
  extends: 'foam.u2.dialog.Popup',
  documentation: `
    A full-featured popup with the application's branding on it.
  `,

  implements: ['foam.mlang.Expressions'],

  imports: [
    'theme'
  ],

  exports: [
    'as actionProvider'
  ],

  requires: [
    'foam.u2.ActionReference',
    'foam.u2.tag.Image'
  ],

  css: `
    ^header-action {
      margin: 12px;
      z-index: 1000;
      cursor: pointer;
      transition: all ease-in 0.1s;
      padding: 0;
    }

    ^inner {
      flex-direction: column;
      overflow: hidden;
    }

    ^header {
      display: flex;
      justify-content: space-between;
      flex-basis: 15px;
      border-bottom: 1px solid /*%GREY4%*/ #777777;
      padding: 12px;
    }

    ^header-left {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    ^header-center {
      display: flex;
      text-align: center;
      align-items: center;
    }

    ^body {
      flex-grow: 1;
      max-height: 90vh;
      overflow: auto;
    }

    ^logo img, ^logo svg {
      display: flex;
      height: 25px;
      max-height: 40px;
    }

    ^header-button-placeholder {
      min-width: 56px;
    }
  `,

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.ActionReference',
      name: 'customActions'
    }
  ],

  methods: [
    function init() {
      var content;

      const self = this;

      this.addClass()
        .enableClass(this.myClass('fullscreen'), this.fullscreen$)
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.closeable ? this.closeModal.bind(this) : null)
        .end()
        .start()
          .enableClass(this.myClass('inner'), this.isStyled$)
          .style({ 'background-color': this.isStyled ? this.backgroundColor : ''})
          .start()
            .show(this.showActions$)
            .addClass(this.myClass('header'))
            .start()
              .addClass(this.myClass('header-left'))
              .add(this.slot(function ( customActions ) {
                if ( ! customActions || customActions.length === 0 ) {
                  return this.E().addClass(this.myClass('header-button-placeholder'));
                }
                return this.E()
                  .addClass(this.myClass('header-button-placeholder'))
                  .forEach(customActions, function (ar) {
                    this
                      .start(ar.action, { label: '', buttonStyle: 'TERTIARY', data$: ar.data$ })
                        .addClass(self.myClass('header-action'))
                      .end()
                      ;
                  });
              }))
            .end()
            .start()
              .addClass(this.myClass('header-center'))
              .start(this.Image, {
                data$: this.slot(function(theme$topNavLogo) {
                  return theme$topNavLogo;
                }),
                embedSVG: true
              })
                .addClass(this.myClass('logo'))
              .end()
            .end()
            .start()
              .addClass(this.myClass('header-right'))
              .startContext({ data: this })
                .start(this.CLOSE_MODAL, { buttonStyle: 'TERTIARY' })
                  .show(this.closeable$.and(this.showActions$))
                  .addClass(this.myClass('header-action'))
                .end()
              .endContext()
            .end()
          .end()
          .start()
            .addClass(this.myClass('body'))
            .call(function() { content = this; })
          .end()
        .end();

      this.content = content;
    },

    function addAction(actionRef) {
      this.customActions$push(actionRef);
    },

    function removeAction(actionRef) {
      this.customActions$remove(this.EQ(
        this.DOT(this.ActionReference.ACTION, foam.core.Action.NAME),
        actionRef.action.name));
    }
  ],
});