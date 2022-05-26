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
      name: 'selectedBackgroundColor',
      value: '$primary50'
    },
    {
      name: 'hoverBackgroundColor',
      value: '$grey50'
    },
    {
      name: 'selectedIconColor',
      value: '$primary500'
    },
    {
      name: 'defaultIconColor',
      value: '$grey400'
    },
    {
      name: 'hoverLabelColor',
      value: '$primary700'
    },
    {
      name: 'defaultLabelColor',
      value: '$grey600'
    },
    {
      name: 'selectedLabelColor',
      value: '$primary700'
    },
  ],
  css: `
    ^:hover:not(:disabled) {
      background-color: $hoverBackgroundColor;
      color:  $hoverLabelColor;
    }
    ^:hover:not(:disabled) svg {
      fill:  $hoverLabelColor;
    }
    ^:active {
      background-color: $selectedBackgroundColor;
      color:  $selectedLabelColor;
    }
    ^:active svg {
      fill: $selectedIconColor;
    }
    ^{
      color: $defaultLabelColor;
    }
    ^ svg {
      fill: $defaultIconColor;
    }
  `
});
