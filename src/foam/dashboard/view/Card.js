/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Card',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.view.SimpleAltView'
  ],
  imports: [
    'dashboardController'
  ],
  exports: [
    'contentWidth as visualizationWidth',
    'contentHeight as visualizationHeight',
    'visualizationColors',
    'dataof as of',
  ],
  constants: [
    {
      name: 'SIZES',
      value: {
        TINY:    [176, 358],
        SMALL:   [312, '-'],
        SMEDIUM: [312, 358],
        MEDIUM:  [424, 356],
        LMEDIUM: [570, 450],
        LARGE:   [936, 528],
        XLARGE:  [1580, 698],
      }
    }
  ],
  properties: [
    {
      name: 'width',
      expression: function(data$size) {
        return this.SIZES[data$size.name][0];
      }
    },
    {
      name: 'height',
      expression: function(data$size) {
        return this.SIZES[data$size.name][1];
      }
    },
    {
      name: 'contentWidth',
      expression: function(width) {
        return width;
      }
    },
    {
      name: 'contentHeight',
      expression: function(height) {
        // 70 is height of header as dictated by the ^header CSS class
        return height - 60;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'cardData'
    },
    {
      name: 'visualizationColors',
      expression: function(data$colors) {
        return data$colors;
      }
    },
    {
      name: 'dataof',
      expression: function(data$dao$of) {
        return data$dao$of;
      }
    },
  ],
  css: `
    ^ {
      border-radius: 10px;
      background: $white;
      box-shadow: 3px 8px 6px -2px $grey300;;
    }

    ^header {
      padding-left: 20px;
      padding-right: 16px;
      padding-top: 20px;
      padding-bottom: 20px;
      font-weight: 500;
      height: 20px;
      display: flex;
      align-items: center;
      font-size: 1.7rem;
      justify-content: space-between;
    }
  `,
  methods: [
    function init() {
      this.onDetach(this.dashboardController.sub('dashboard', 'update', function() {
        this.data.update();
      }.bind(this)));
      this.data?.update?.();

      var view = this;

      this.
        style({
          width: this.slot(function(data$mode, width) {
            return data$mode == 'config' ? 'inherit' : ( width + 'px' );
          }),
          height: this.slot(function(data$mode, height) {
            return data$mode == 'config' ? 'inherit' : ( height + 'px' );
          })
        }).
        addClass(this.myClass()).
        start('div').
        addClass(this.myClass('header')).
        show(!!this.data.label || !!this.data.configView).
        start().
          style({ float: 'left' }).
          add(this.data.label$).
        end().
        start().
          style({ float: 'right' }).
          tag(this.data.configView).
        end().
        end('div').
        start('div').
        addClass(this.myClass('content')).
          tag('div', null, this.content$).
        end('div');
    }
  ]
});
