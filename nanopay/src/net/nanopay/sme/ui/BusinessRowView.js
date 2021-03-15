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
  package: 'net.nanopay.sme.ui',
  name: 'BusinessRowView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: 'A single row in a list of businesses.',

  imports: [
    'businessSectorDAO',
    'contactDAO',
    'user'
  ],

  requires: [
    'foam.nanos.auth.AgentJunctionStatus',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business'
  ],

    css: `
      ^ {
        background: white;
        background-color: #ffffff;
        border: solid 1px #e2e2e3;
        border-radius: 3px;
        box-shadow: 0 1px 1px 0 #dae1e9;
        box-sizing: border-box;
        height: 64px;
        margin-bottom: 8px;
        padding: 0 24px;
      }
      ^on-hover {
        cursor: pointer;
      }
      ^:hover ^select-icon {
        background: url(images/ablii/selectcompanyarrow-active.svg);
      }
      ^row {
        align-items: center;
        display: flex;
        justify-content: space-between;
      }
      ^business-name {
        font-size: 16px;
        font-weight: 800;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.5;
        letter-spacing: normal;
        color: /*%BLACK%*/ #1e1f21;
      }
      ^business-location {
        font-size: 10px;
        line-height: 1.5;
        color: #8e9090
      }
      ^select-icon {
        background: url(images/ablii/selectcompanyarrow-resting.svg);
        height: 32px;
        width: 32px;
      }
      ^status {
        color: #07941f;
        font-size: 11px;
      }
      ^status-dot {
        background-color: #07941f;
        margin-right: 6px;
        height: 4px;
        width: 4px;
        border-radius: 999px;
        margin-top: 1px;
      }
    `,

    messages: [
      { name: 'CONNECTED', message: 'Connected' }
    ],

    properties: [
      {
        class: 'FObjectProperty',
        of: 'net.nanopay.model.Business',
        name: 'data',
        documentation: 'Set this to the business you want to display in this row.'
      },
      {
        type: 'Boolean',
        name: 'isConnected',
        value: 'false'
      }
    ],

    methods: [
      function init() {
        this.contactDAO
          .where(this.EQ(this.Contact.BUSINESS_ID, this.data.id))
          .select(this.COUNT())
          .then((countSink) => {
            this.isConnected = countSink.value !== 0;
          });
      },

      function initE() {
        this.start()
          .addClass(this.myClass())
          .addClass(this.myClass('row'))
          .enableClass(this.myClass('on-hover'), this.isConnected$, true)
          .start()
            .start()
              .addClass(this.myClass('business-name'))
              .add(this.slot(function(data) {
                return data ? data.toSummary() : '';
              }))
            .end()
            .start()
              .addClass(this.myClass('business-location'))
              .add(this.slot(async function(data) {
                if ( data ) {
                  var businessSector = await this.businessSectorDAO.find(data.businessSectorId);
                  var city = data.address.city;
                  var region = data.address.regionId;
                  let industry = businessSector ? businessSector.name : '';
                  if ( city && region ) {
                    return `${industry} • ${city}, ${region}`;
                  } else if ( region ) {
                    return region;
                  } else if ( city ) {
                    return city;
                  } else {
                    return '';
                  }
                }
              }))
            .end()
          .end()
          .start()
            .show(this.isConnected$)
            .addClass(this.myClass('row'))
            .start()
              .addClass(this.myClass('status-dot'))
            .end()
            .start()
              .addClass(this.myClass('status'))
              .add(this.CONNECTED)
            .end()
          .end()
          .start()
            .hide(this.isConnected$)
            .addClass(this.myClass('row'))
            .start()
              .attrs({ name: 'selectBusiness' })
              .addClass(this.myClass('select-icon'))
            .end()
          .end()
        .end();
      }
    ]
  });
