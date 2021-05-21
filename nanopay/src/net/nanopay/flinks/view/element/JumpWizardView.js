/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.flinks.view.element',
  name: 'JumpWizardView',
  extends: 'net.nanopay.ui.wizard.WizardView',
  abstract: true,

  documentation: 'View that handles unpredictable multi step procedures.',

  imports: [
    'stack'
  ],

  properties: [
    'startView',
    'errorView',
    'successView',
    //key value
    'views',
    //String
    'currentViewId',
    //Array of Int
    'rollBackPoints',
    //Array of sequest View ID
    'sequenceViewIds',
    'pushView'
  ],

  methods: [
    function init() {
      var self = this;
      if ( ! this.title ) { console.warn('[WizardView] : No title provided'); }

      //inital rollback point array
      this.rollBackPoints = [];
      //record sequence of views pass, use to record currentViewId when rollback;
      this.sequenceViewIds = [];
      //create stack for the this wizard view
      this.subStack = this.Stack.create();

      //notice WizardOverview to change the label position
      this.currentViewId$.sub(function() {
        self.position = self.views[self.currentViewId].step - 1;
      });

      //record start, error, and success view
      for ( var j in this.views ) {
        if ( this.views.hasOwnProperty(j) ) {
          if ( !! this.views[j].start && this.views[j].start === true ) {
            this.startView = j;
          } else if ( !! this.views[j].error && this.views[j].error === true ) {
            this.errorView = j;
          } else if ( !! this.views[j].success && this.views[j].success === true ) {
            this.successView = j;
          }
        }
      }

      // if ( ! this.startView || ! this.errorView || ! this.successView ) {
      //   console.error('[JumpWizardView] : no startView, errorView, successView define');
      //   return;
      // }

      //inital start view
      this.pushViews(this.startView, true);
    },

    //use super method the inital the view elements
    function initE(){
      this.SUPER();
    },

    //go the successView
    function success() {
      this.pushViews(this.successView);
    },

    //go to failView
    function fail(callback) {
      this.pushViews(this.errorView);

      if (typeof callback === 'function') {
        callback();
      }
    },

    function rollBackView() {
      if ( this.rollBackPoints.length === 0 ) {
        this.stack.back();
        return;
      }
      var point = this.rollBackPoints[this.rollBackPoints.length - 1];
      if ( point === this.subStack.pos ) {
        this.rollBackPoints.pop();
        if ( this.rollBackPoints.length === 0 ) {
          this.stack.back();
          return;
        }
        point = this.rollBackPoints[this.rollBackPoints.length - 1];
      }
      while ( this.subStack.pos != point ) {
        this.subStack.back();
        this.sequenceViewIds.pop();
      }
      this.currentViewId = this.sequenceViewIds[this.sequenceViewIds.length-1];
    },

    function pushViews(viewId, rollBack) {
      if ( ! viewId && ! this.views[viewId] ) {
        console.error('[JumpWizardView] : can not find view');
        return;
      }
      this.currentViewId = viewId;
      this.sequenceViewIds.push(viewId);
      this.subStack.push(this.views[viewId].view);
      if ( rollBack === true ) {
        this.rollBackPoints.push(this.subStack.pos);
      }
    }
  ],

  actions: [
    {
      name: 'goBack',
      code: function() {
        //TODO: if (this.currentViewId == id)
        this.rollBackPoints();
      }
    },
    {
      name: 'goNext',
      code: function() {
      }
    }
  ]
})
