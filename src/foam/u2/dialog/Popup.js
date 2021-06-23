/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

foam.CLASS({
  package: 'foam.u2.dialog',
  name: 'Popup',
  extends: 'foam.u2.Element',

  documentation: `This is a container for a whole-screen, modal overlay. It
    fills the viewport with a transparent grey background, and then
    centers the "content" element. Clicking the background closes the
    dialog. Exports itself as "overlay", for use by OK and CANCEL buttons.`,

  exports: [
    'close as closeDialog'
  ],

  css: `
    ^ {
      align-items: center;
      bottom: 0;
      display: flex;
      height: 100%;
      justify-content: space-around;
      left: 0;
      position: fixed;
      right: 0;
      top: 0;
      width: 100%;
      z-index: 1000;
    }
    ^X {
      position: absolute;
      top: min(10%, 16px);
      right: min(10%, 16px);
      z-index: 1000;
      cursor: pointer;
      transition: all ease-in 0.1s;
      padding: 0;
    }
    ^X:hover{
      transform: scale(1.1)
    }
    ^background {
      background-color: #000;
      bottom: 0;
      left: 0;
      opacity: 0.4;
      position: absolute;
      right: 0;
      top: 0;
    }
    ^inner {
      z-index: 3;
      position: relative;
      /* The following line fixes a stacking problem in certain browsers. */
      will-change: opacity;
    }
 `,

  properties: [
    [ 'backgroundColor', '#fff' ],
    {
      name: 'closeable',
      class: 'Boolean',
      value: true
    },
    'onClose',
    {
      name: 'isStyled',
      value: true,
      documentation: 'Can be used to turn off all styling for modal container'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var content;

      this.addClass(this.myClass())
        .on('keydown', this.onKeyDown)
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.closeable ? this.close : null)
        .end()
        .start()
          .call(function() { content = this; })
          .enableClass(this.myClass('inner'), this.isStyled$)
          .style({ 'background-color': this.isStyled ? this.backgroundColor : ''})
          .startContext({ data: this })
            .start(this.CLOSE_MODAL, { buttonStyle: 'TERTIARY' }).show(this.closeable$)
              .addClass(this.myClass('X'))
            .end()
          .endContext()
        .end();

      this.content = content;
    },

    function open() {
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
      this.load();
    }
  ],

  listeners: [
    function close() {
      if ( this.onClose ) this.onClose();
      this.remove();
    },

    function onKeyDown(e) {
      var isEsc = (e.key === 'Escape' || e.keyCode === 27); // 27 is the keyCode for escape keys, keyCode is mainly for older browser support
      if ( isEsc ) { this.close(); }
    }
  ],

  actions: [
    {
      name: 'closeModal',
      icon: 'images/ic-cancelblack.svg',
      label: '',
      code: function(X) {
        this.close();
      }
    }
  ]
});
