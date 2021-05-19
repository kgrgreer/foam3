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
  package: 'net.nanopay.auth',
  name: 'SwitchUserRowView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A single row of agentJunctions that displays the group, spid and
    name of the target user.
  `,

  imports: [
    'theme'
  ],

  requires: [
    'foam.nanos.auth.AgentJunctionStatus',
    'foam.core.Glyph'
  ],

  css: `
    ^ {
      background: white;
      background-color: #ffffff;
      border-radius: 3px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      box-sizing: border-box;
      border: solid 1px #e2e2e3;
      height: 78px;
      margin-bottom: 8px;
      padding: 0 24px;
    }
    ^disabled {
      background-color: #EFEFEF;
    }
    ^disabled-spid-name {
      color: #7a7e80;
      font-size: 18px;
      font-weight: 800;
    }
    ^disabled-user-name {
      font-size: 14px;
      font-weight: 500;
      color: #6f7273;
    }
    ^enabled:hover {
      cursor: pointer;
    }
    ^disabled:hover {
      cursor: default;
    }
    ^row {
      align-items: center;
      display: flex;
      justify-content: space-between;
    }
    ^spid-name {
      font-size: 18px;
      font-weight: 800;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^user-name {
      font-size: 14px;
      font-weight: 500;
      color: /*%GREY1%*/ #5e6061;
    }
    ^spid-username-box {
      display: inline-flex;
      flex-direction: column;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
    }
    ^select-icon {
      height: 32px;
      width: 32px;
    }
    ^status {
      color: #f91c1c;
      margin-right: 27px;
      font-size: 11px;
    }
    ^status-dot {
      background-color: #f91c1c;
      margin-right: 6px;
      height: 4px;
      width: 4px;
      border-radius: 999px;
      margin-top: 1px;
    }
  `,

  messages: [
    { name: 'AS_LABEL', message: 'as ' },
    { name: 'DISABLED', message: 'Disabled' },
    { name: 'CURRENTLY_ACTING_AS', message: 'Currently acting as' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.UserUserJunction',
      name: 'data',
      documentation: 'Set this to the user you want to display in this row.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'entity'
    },
    {
      class: 'Boolean',
      name: 'isHoveredOver'
    },
    {
      class: 'Boolean',
      name: 'currentlyActive'
    },
    {
      name: 'arrow',
      class: 'FObjectProperty',
      of: 'foam.core.Glyph',
      factory: function () {
        return this.Glyph.create({
          template: `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <g fill="none">
    <g transform="translate(-836 -333)translate(388 308)translate(448 25)">
      <circle cx="16" cy="16" r="16" fill="/*%FILL%*/ #E2E2E3"/>
      <g transform="translate(16 16)scale(-1 1)translate(-16 -16)translate(4 4)">
        <polygon points="0 0 24 0 24 24 0 24"/>
        <polygon points="20 11 7.8 11 13.4 5.4 12 4 4 12 12 20 13.4 18.6 7.8 13 20 13" fill="#FFFFFF"/>
      </g>
    </g>
  </g>
</svg>`
        });
      }
    }
  ],

  methods: [
    function init() {
      if ( this.data ) {
        this.entity = this.data.targetUser;
      }
    },

    function initE() {
      var self = this;
      var disabled = this.data.status === this.AgentJunctionStatus.DISABLED || this.currentlyActive;
      var e = this.start()
        .on('mouseover', function() { self.isHoveredOver = true })
        .on('mouseout', function() { self.isHoveredOver = false });

      e.addClass(this.myClass())
        .addClass(this.myClass('row'))
        .addClass(disabled ? this.myClass('disabled') : this.myClass('enabled'))
        .start()
          .addClass(this.myClass('spid-username-box'))
          .start('span')
            .addClass(disabled ? this.myClass('disabled-spid-name') : this.myClass('spid-name'))
            .add(self.data.group)
          .end()
          .start('span')
            .addClass(disabled ? this.myClass('disabled-user-name') : this.myClass('user-name'))
            .add(this.slot(function(entity) {
              return entity ? this.AS_LABEL + entity.spid + ': ' + entity.toSummary() : '';
            }))
          .end()
        .end()
        .start()
          .addClass(this.myClass('row'))
          .start()
            .addClass(this.myClass('row'))
            .show(disabled)
            .start()
              .addClass(this.myClass('status-dot'))
            .end()
            .start()
              .addClass(this.myClass('status'))
              .add(this.currentlyActive ? this.CURRENTLY_ACTING_AS : this.DISABLED)
            .end()
          .end()
          .add(this.slot(function(isHoveredOver, data, currentlyActive) {
            if ( currentlyActive ) return;
            if ( data.status === this.AgentJunctionStatus.DISABLED ) return;
            const color = isHoveredOver ? self.theme.primary1 : '#E2E2E3';

            return self.E().start()
              .style({ background: 'url(' + self.arrow.getDataUrl({ fill: color }) + ')' })
              .addClass(self.myClass('select-icon'))
            .end();
          }))
        .end()
      .end();
    }
  ]
});
