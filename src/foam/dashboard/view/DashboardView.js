/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'DashboardView',
  extends: 'foam.dashboard.view.Dashboard',

  imports: [
    'menuDAO'
  ],

  requires: [
    'foam.nanos.menu.Menu'
  ],

  css: `
    ^ {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    ^main {
      padding: 24px 32px;
    }
    ^widget-container {
      width: 100%;
      display: grid;
      flex-grow: 1;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Dashboard' }
  ],

  properties: [
    {
      class: 'String',
      name: 'viewTitle',
      factory: function() {
        return this.TITLE;
      }
    },
    'dashboardTitle',
    {
      name: 'main',
      documentation: 'Should be set to true on the most top-level dashboard.',
      value: false
    },
    {
      name: 'width',
      documentation: 'The fixed number of grid columns for the dashboard.',
      value: 12
    },
    {
      name: 'height',
      documentation: 'The fixed number of grid rows for the dashboard.',
      value: 12
    },
    {
      name: 'gap',
      documentation: 'The px gap between dashboard widgets.',
      value: 15
    },
    {
      class: 'Map',
      name: 'widgets',
      documentation: 'Mapping of menu id to aspect ratio for widgets that will be displayed in the dashboard.',
      factory: function() {
        return {};
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();

      var widgetContainer = this.E()
        .addClass(this.myClass('widget-container'))
        .style({ 
          'grid-template-columns': 'repeat(' + this.width + ', 1fr)',
          'grid-template-rows': 'repeat(' + this.height + ', 1fr)',
          'grid-gap': this.gap + 'px'
        });

      Object.keys(this.widgets).map( async menuId => {
        let menu = await this.menuDAO.find(menuId);
        if ( menu ) {
          let aspectRatio = this.widgets[menu.id];
          widgetContainer.start(menu.handler.view).style({
            'grid-column': 'span ' + aspectRatio.split('/')[0],
            'grid-row': 'span ' + aspectRatio.split('/')[1]
          }).end();
        }
      })

      this
        .addClass(this.myClass())
        .enableClass(this.myClass('main'), this.main)
        .start()
          .hide(!this.dashboardTitle)
          .enableClass('h500', this.dashboardTitle)
          .style({ height: '2em' })
          .add(this.dashboardTitle)
        .end()
        .tag(widgetContainer)
    }
  ]
});

