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
  name: 'OrWizardView',
  extends: 'net.nanopay.ui.wizard',
  abstract: true,
  documentation: `Wizard that the next step can be select at runtime
                  The next view must be provide`,

  properties: [
    // String of current View Id
    'currentView',
    //array of view sequece
    'viewSequence',
    //View map
    'viewMap'
  ],

  imports: [
    'stack'
  ],

  methods: [
    function init() {
      var self = this;
      if ( ! this.title ) { console.warn('[WizardView] : No title provided'); }

      this.viewSequence = [];
      this.viewMap = {};
      this.subStack = this.Stack.create();

      if ( this.viewTitles.length == 0 ) { console.error('[OrWizardView] : No viewTitles provide'); }
      this.views.forEach(function(viewData){
        if ( viewData.start == true ) {
          if ( self.viewSequence.length == 0 ) {
            self.viewSequence[0] = viewData.id;
            self.currentView = viewData.id;
          } else {
            console.error('[OrWizardView] : more than one start view found');
          }
        }
        if ( ! self.viewMap[viewData.id] ) {
          //self.viewMap[viewData.id] = {'view' : viewData.view, 'position': viewData.position};
          self.viewMap[viewData.id] = viewData;
        } else {
          console.error('[OrWizardView] : duplicate view id');
        }
      });

      //bound currentViewId to the subStack

      if ( this.viewSequence.length != 1 ) {
        console.error('[OrWizardView] : no first view provide');
      } else {
        this.subStack.push(this.viewMap[this.viewSequence[0]].view);
      }
    },
    function initE() {
      this.SUPER();
    },

    function nextView() {
      if ( arguments.length == 0 ) { console.error('[WizardView] : no given next view'); }
      if ( !this.viewMap[arguments[0]] ) { 
        console.error('[OrWizardView] : can not find view by given Id'); 
      } else if ( this.viewMap[arguments[0]] < this.viewSequence.slice(-1).position ) {
        console.error('[OrWizardView] : the view is previous step of current view'); 
      } else {
        this.subStack.push(this.viewMap[arguments[0]].view);
        this.viewSequence.push(arguments[0]);
        this.position = this.viewSequence.slice(-1).position;
      }
    },
    function backView() {
      if ( this.viewSequence.length > 1 ) {
        this.subStack.back();
        this.viewSequence.pop();
        this.position = this.viewSequence.slice(-1).position;
      } else {
        this.stack.back();
      }
    }
  ],

  actions: [
    {
      name: 'goBack',
      code: function(X) {
        this.backView();
      }
    },
    {
      name: 'goNext',
      isAvailable: function(position, errors) {
        if ( errors ) return false; // Error present
        return false;
      },
      code: function(X) {
        console.error('[OrWizardView] : goNext function do not implement');
      }
    }
  ]
})