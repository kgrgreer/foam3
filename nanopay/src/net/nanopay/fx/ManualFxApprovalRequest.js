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
  package: 'net.nanopay.fx',
  name: 'ManualFxApprovalRequest',

  documentation: 'Approval request that stores a CAD to INR FX rate',

  extends: 'foam.nanos.approval.ApprovalRequest',

  requires: [
    'foam.u2.dialog.Popup',
    'foam.log.LogLevel'
  ],

  imports: [
    'summaryView?',
    'objectSummaryView?'
  ],

  messages: [
    { name: 'REQUEST_UPDATED', message: 'Approval request successfully updated' }
  ],

  properties: [
    {
      class: 'String',
      name: 'dealId',
      section: 'approvalRequestInformation',
      order: 95,
      gridColumns: 6
    },
    {
      class: 'Double',
      name: 'fxRate',
      section: 'approvalRequestInformation',
      order: 96,
      gridColumns: 6
    },
    {
      class: 'DateTime',
      name: 'valueDate',
      section: 'approvalRequestInformation',
      order: 97,
      gridColumns: 6
    },
    {
      class: 'DateTime',
      name: 'expiryDate',
      section: 'approvalRequestInformation',
      order: 98,
      gridColumns: 6
    }
  ],
  
  actions: [
    {
      name: 'updateDealId',
      section: 'approvalRequestInformation',
      code: function(X) {
        var objToAdd = X.objectSummaryView ? X.objectSummaryView : X.summaryView;
        objToAdd.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: 'foam.u2.PropertyModal',
          property: this.DEAL_ID,
          isModalRequired: true,
          data$: X.data$,
          propertyData$: X.data.dealId$,
          title: 'Update Deal Id',
          onExecute: this.requestUpdated.bind(this, X)
        }));
      }
    },
    {
      name: 'updateFxRate',
      section: 'approvalRequestInformation',
      code: function(X) {
        var objToAdd = X.objectSummaryView ? X.objectSummaryView : X.summaryView;
        objToAdd.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: 'foam.u2.PropertyModal',
          property: this.FX_RATE,
          isModalRequired: true,
          data$: X.data$,
          propertyData$: X.data.fxRate$,
          title: 'Update Fx Rate',
          onExecute: this.requestUpdated.bind(this, X)
        }));
      }
    }
  ],

  listeners: [
    {
      name: 'requestUpdated',
      code: function(X) {
        var clonedApprovalRequest = this.clone();
        this.approvalRequestDAO.put(clonedApprovalRequest).then((req) => {
          this.notify(this.REQUEST_UPDATED, '', this.LogLevel.INFO, true);
        });
      }
    }
  ]
});
