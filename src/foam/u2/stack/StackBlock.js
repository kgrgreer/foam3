/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.stack',
  name: 'StackBlock',
  flags: ['web'],

  documentation: `Represents a single block in the stack,
  can be used to push views to the stack and keep track of information about any view in the stack`,

  topics: [
    'removed'
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    },
    {
      name: 'parent'
    },
    {
      name: 'id',
      documentation: `Used to give some unique id to the view being pushed.
                      If it matches the current view then push() ignored.`
    },
    {
      class: 'String',
      name: 'breadcrumbTitle',
      documentation: `Used as the label in the breadcrumb for this view
                      A null value ignores this view in breadcrumbView`
    },
    {
      class: 'Boolean',
      name: 'shouldResetBreadcrumbs',
      documentation: 'DEPRECATED: Used by Stack to determine if breadcrumb trail should be reset'
    },
    {
      name: 'popup',
      documentation: `Used by DesktopStackView to determine if view should be wrapped in a popup,
                      takes in arguments that are passed onto the Popup`
    },
    {
      name: 'currentMemento'
    },
    {
      name: 'historyPos',
      documentation: 'Position in window.history.'
    }
  ]
});
