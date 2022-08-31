/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.view',
  name: 'NavigationButton',
  extends: 'foam.u2.ActionView',
  mixins: ['foam.u2.view.NavButtonMixin'],
  documentation: 'Button style to be used by nav components, typically differs drastically from other buttons so is subclassed',
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'NavigationOverlayButton',
  extends: 'foam.u2.view.OverlayActionListView',
  mixins: ['foam.u2.view.NavButtonMixin'],
  documentation: 'OverlayActionListButton style to be used by nav components, typically differs drastically from other buttons so is subclassed',
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'NavButtonMixin',
  documentation: 'Mixin with tokens requred for navigation buttons',
  cssTokens: [
    {
      name: 'NavButtonBackgroundColor',
      class: 'foam.u2.ColorToken',
      value: '$foam.nanos.menu.VerticalMenu.menuBackground',
      onLight: '$grey700',
      disabledModifier: -10,
      hoverModifier: -10,
      activeModifier: -15
    },
    {
      name: 'NavSelectedIconColor',
      value: function(e) { return e.LIGHTEN(e.TOKEN('$selectedLabelColor'), 10) }
    },
    {
      class: 'foam.u2.ColorToken',
      name: 'NavButtonSelectedLabelColor',
      value: '$primary600'
    }
  ],
  css: `
    ^:hover:not(:disabled):not(:active):not(.selected) {
      background-color: $backgroundColor$hover;
      color: $backgroundColor$hover$foreground;
    }
    ^:hover:not(:disabled):not(:active):not(.selected) svg {
      fill: $backgroundColor$hover$foreground;
    }
    ^:active, ^.selected {
      background-color: $backgroundColor$hover;
      color:  $selectedLabelColor;
    }
    ^:active svg,^.selected svg {
      fill: $selectedIconColor;
    }
    ^{
      color: $backgroundColor$foreground;
    }
    ^ svg {
      fill: $backgroundColor$foreground;
    }
  `
});
