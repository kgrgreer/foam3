/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.country.br',
  name: 'NatureCodeApprovalRequest',
  extends: 'foam.nanos.approval.ApprovalRequest',

  documentation: `
    NatureCodeApprovalRequest links NatureCodeData for an approval request that
    relates to a NatureCode
  `,

  requires: [
    'foam.dao.AbstractDAO',
    'foam.u2.dialog.Popup',
    'foam.log.LogLevel',
    'foam.nanos.approval.ApprovalStatus'
  ],

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.ruler.Operations',
    'java.util.ArrayList',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  imports: [
    'DAO approvalRequestDAO',
    'ctrl',
    'currentMenu',
    'notify',
    'stack',
    'summaryView?',
    'objectSummaryView?',
    'natureCodeDataDAO'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.country.br.NatureCode',
      name: 'natureCode',
      section: 'requestDetails'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.country.br.NatureCodeData',
      name: 'natureCodeData',
      section: 'requestDetails',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();

        // TODO: for some reason this doesn't update when nature code changes
        // isn't a concern for this use  case however since Nature Code shouldn't be changing
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Select a Nature Code',
              dao$: X.data.slot(function(natureCode) {
                return X.natureCodeDataDAO.where(
                  E.EQ(net.nanopay.country.br.NatureCodeData.NATURE_CODE, natureCode)
                )
              })
            }
          ],
          choosePlaceholder: '--'
        };
      },
    },
  ],

  actions: [
    {
      name: 'approve',
      section: 'requestDetails',
      isAvailable: (isTrackingRequest, status) => {
        if (
          status === foam.nanos.approval.ApprovalStatus.REJECTED ||
          status === foam.nanos.approval.ApprovalStatus.APPROVED ||
          status === foam.nanos.approval.ApprovalStatus.CANCELLED
        ) {
          return false;
        }
        return ! isTrackingRequest;
      },
      code: function(X) {
        var objToAdd = X.objectSummaryView ? X.objectSummaryView : X.summaryView;
        objToAdd.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: "foam.u2.PropertyModal",
          property: this.NATURE_CODE_DATA,
          isModalRequired: true,
          data$: X.data$,
          title: "Please select a nature code (required)",
          onExecute: this.approveWithData.bind(this, X)
        }));
      }
    },
    {
      name: 'reject',
      section: 'requestDetails',
      isAvailable: (isTrackingRequest, status) => {
        if (
          status === foam.nanos.approval.ApprovalStatus.REJECTED ||
          status === foam.nanos.approval.ApprovalStatus.APPROVED ||
          status === foam.nanos.approval.ApprovalStatus.CANCELLED
        ) {
          return false;
        }
        return ! isTrackingRequest;
      },
      code: function(X) {
        var objToAdd = X.objectSummaryView ? X.objectSummaryView : X.summaryView;

        objToAdd.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: "foam.u2.MemoModal",
          onExecute: this.rejectWithMemo.bind(this, X),
          isMemoRequired: true
        }));
      }
    },
  ],
  listeners: [
    {
      name: 'approveWithData',
      code: function(X) {
        var approvedApprovalRequest = this.clone();
        approvedApprovalRequest.status = this.ApprovalStatus.APPROVED;

        this.approvalRequestDAO.put(approvedApprovalRequest).then((req) => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.notify(this.SUCCESS_APPROVED, '', this.LogLevel.INFO, true);

          X.stack.back();
        }, (e) => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
