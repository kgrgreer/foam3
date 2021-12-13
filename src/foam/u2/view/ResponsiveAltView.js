/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ResponsiveAltView',
  extends: 'foam.u2.View',
  documentation: `
    Sets one of the views as the selectedView based on current window display width.

    Default to the largest possible specified view. In cases with multiple views for a 
    displayWidth, the first view provided takes priority.

    Example usage:
        {
          class: 'foam.u2.view.ResponsiveAltView',
          views: [
            [
              {
                // view 1 spec
              },
              ['MD', 'LG'],
              'View 1'
            ],
            [
              {
                // view 2 spec
              },
              ['MD'],
              'View 2'
            ]
          ]
        }
  `,

  imports: [ 'displayWidth' ],

  requires: ['foam.u2.layout.DisplayWidth'],

  properties: [
    'prop',
    {
      name: 'views',
      factory: function() { return []; }
    },
    {
      name: 'selectedView',
      view: function(_, X) {
        return X.data.RadioView.create({choices: X.data.views, isHorizontal: true, columns: 8}, X);
      },
      factory: function() {
        return this.views[0][0];
      },
      adapt: function(_, nu) {
        if ( foam.String.isInstance(nu) ) {
          for ( var i = 0; i < this.views.length; i++ ) {
            if ( this.views[i][1] === nu ) {
              return this.views[i][0];
            }
          }
        } else if ( foam.Number.isInstance(nu) ) {
          return this.views[nu][0];
        }
        return nu;
      }
    },
    {
      class: 'Map',
      name: 'viewMap'
    }
  ],
  methods: [
    function render() {
      this.SUPER();
      var self = this;
      this.views$.sub(this.createViewMap);
      this.createViewMap();
      this.displayWidth$.sub(this.maybeUpdateView);
      this.maybeUpdateView();
      // TODO: Too many wrapping divs
      this
        .addClass()
        .add(this.selectedView$.map(function(v) {
          return self.E().start(v, { data: self.data })
            .call(function() {
              self.prop && this.fromProperty && this.fromProperty(self.prop);
            })
          .end();
        }));
    },
    function fromProperty(prop) {
      this.prop = prop;
    }
  ],

  listeners: [
    {
      name: 'createViewMap',
      isFramed: true,
      code: function() {
        this.clearProperty('viewMap');
        this.views.forEach(v => {
          if ( ! v[1] ) return;
          v[1].forEach(dw => {
            if ( ! this.viewMap[dw] ) this.viewMap[dw] = [];
            this.viewMap[dw].push(v[0]);
          });
        });
      }
    },
    {
      name: 'maybeUpdateView',
      isFramed: true,
      code: function() {
        var self = this;
        // Try to find an exact match for current displayWidth
        if ( this.viewMap[this.displayWidth.name] ) {
          // TODO: add option to switch between all available views
          this.selectedView = this.viewMap[this.displayWidth.name][0];
          return;
        }
        var newView;
        // Try to find the largest possible view for current breakpoint
        this.DisplayWidth.VALUES
          .sort(this.DisplayWidth.ORDINAL.compare)
          .forEach(dw => {
            if ( newView && dw.minWidth > self.displayWidth.minWidth ) return;
            if ( this.viewMap[dw.name] )
              newView = this.viewMap[dw.name][0];
          });
        this.selectedView = newView;
      }
    }
  ]
});
