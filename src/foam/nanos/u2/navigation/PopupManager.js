/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'PopupManager',
  documentation: `TODO: Make this more full featured where it can handle and prioritize multiple popups and also make a mobile version`,
  properties: [
  ],
  methods: [
    function push(spec, parent, popupConfig = {}) {
      // returns the popup it renders so parent views can listen to close events
      let v = spec;
      parent = parent || this;
      let cls = popupConfig ? this.__subContext__.lookup(popupConfig.class) : foam.u2.dialog.Popup;
      let popup = cls.create({ ...popupConfig }, parent);
      if ( ! foam.u2.Element.isInstance(v) ) {
        v = foam.u2.ViewSpec.createView(spec, {}, popup, popup); 
      } else {
        console.warn('popup rendering requires viewspec to pass the correct context');
        return;
      }
      // Might be needed in future
      // popup.sub('action', 'closeModal', () => {
      //   Remove from manager
      // })
      popup.add(v).open();
      return popup;
    }
  ]
});
