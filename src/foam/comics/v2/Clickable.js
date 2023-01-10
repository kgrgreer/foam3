/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.comics.v2',
  name: 'Clickable',

  imports: [
    'click?',
    'config?',
    'dblclick?',
    'selection?'
  ],

  methods: [
    function insertClick(idObj /* expects an object with an id prop*/) {
      var self = this;
      this.callIf( this.dblclick && ! this.config.disableSelection, function() {
        this.on('dblclick', function(evt) {
            if ( self.shouldEscapeEvts(evt) ) return;
            self.dblclick.call(self, null, idObj.id);
        });
      })
      .callIf( this.click && ! this.config.disableSelection, function() {
        this.on('click', function(evt) {
          if ( self.shouldEscapeEvts(evt) ) return;
          self.selection = idObj.id;
          self.click.call(self, null, idObj.id);
        });
      });
    }
  ],
  listeners: [
    {
      name: 'shouldEscapeEvts',
      documentation: `Use this function to skip clicks/doubleclicks on table
                      elements such as checkboxes/context menus`,
      code: function(evt) {
        if (
          evt.target.nodeName === 'DROPDOWN-OVERLAY' ||
          evt.target.classList.contains(this.myClass('vertDots')) || evt.target.nodeName === 'INPUT'
        ) {
          return true;
        }
      }
    }
  ]
});
