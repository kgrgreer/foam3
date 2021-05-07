/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.country.br',
  name: 'NatureCodeApprovalRequest',
  extends: 'net.nanopay.tx.TransactionApprovalRequest',

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
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.dao.Operation',
    'java.util.ArrayList',
    'java.util.List',
    'foam.util.SafetyUtil',
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

  messages: [
    { name: 'SELECT_DATA', message: 'Please select the data associated to: '},
    { name: 'REQUIRED_LABEL', message: ' (required)' }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.country.br.NatureCode',
      name: 'natureCode',
      section: 'approvalRequestInformation',
      order: 25,
      view: {
        class: 'foam.u2.view.ReferencePropertyView',
        readView: {
          class: 'foam.u2.view.ReadReferenceView',
          enableLink: false
        }
      },
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'net.nanopay.country.br.NatureCodeData',
      name: 'natureCodeData',
      section: 'approvalRequestInformation',
      order: 27,
      gridColumns: 6,
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();

        // TODO: for some reason this doesn't update when nature code changes
        // isn't a concern for this use  case however since Nature Code shouldn't be changing
        return {
          class: 'foam.u2.view.ChoiceView',
          dao$: X.data.slot(function(natureCode) {
            return X.natureCodeDataDAO.where(
              E.EQ(net.nanopay.country.br.NatureCodeData.NATURE_CODE, natureCode)
            )
          }),
          objToChoice: function(obj) {
            return  [obj, obj.toSummary()];
          },
          size: 5,
          selectSpec: { class: 'net.nanopay.country.br.NatureCodeSelectView' }
        }
      }
    }
  ],

  actions: [
    {
      name: 'approveWithMemo',
      isAvailable: () => false,
      code: () => { return; }
    },
    {
      name: 'approve',
      section: 'approvalRequestInformation',
      isAvailable: (isTrackingRequest, status, subject, assignedTo) => {
        if (
          status === foam.nanos.approval.ApprovalStatus.REJECTED ||
          status === foam.nanos.approval.ApprovalStatus.APPROVED ||
          status === foam.nanos.approval.ApprovalStatus.CANCELLED
        ) {
          return false;
        }
        if ( assignedTo !== 0 && subject.realUser.id !== assignedTo ) return false;

        return ! isTrackingRequest;
      },
      code: function(X) {
        let titleSlot = foam.core.SimpleSlot.create();
        X.natureCodeDAO
          .find(this.natureCode)
          .then(obj =>
            titleSlot.set(this.SELECT_DATA + ( obj ? obj.name : this.natureCode ) + this.REQUIRED_LABEL)
          );
        var objToAdd = X.objectSummaryView ? X.objectSummaryView : X.summaryView;
        objToAdd.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: "foam.u2.PropertyModal",
          property: this.NATURE_CODE_DATA.clone().copyFrom({ label: '' }),
          isModalRequired: true,
          data$: X.data$,
          propertyData$: X.data.natureCodeData$,
          title$: titleSlot,
          onExecute: this.approveWithData.bind(this, X)
        }));
      }
    },
    {
      name: 'reject',
      section: 'approvalRequestInformation',
      isAvailable: (isTrackingRequest, status, subject, assignedTo) => {
        if (
          status === foam.nanos.approval.ApprovalStatus.REJECTED ||
          status === foam.nanos.approval.ApprovalStatus.APPROVED ||
          status === foam.nanos.approval.ApprovalStatus.CANCELLED
        ) {
          return false;
        }
        if ( assignedTo !== 0 && subject.realUser.id !== assignedTo ) return false;

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

          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, (e) => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
