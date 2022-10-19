/**
 * NANOPAY CONFIDENTIAL
 *
 * [2022] nanopay Corporation
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

package foam.nanos.approval;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.CopyAdapter;
import foam.nanos.logger.Logger;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.PopulateApprovalRequestSummariesDAO;

/**
 * Adds referenceSummary and createdForSummary to ApprovalRequest
 */
public class PopulateApprovalRequestSummariesAdapter extends CopyAdapter {
  protected X x_;
  protected PopulateApprovalRequestSummariesDAO decorator_;

  /**
   * @param x
   * @param of
   * @param decorator to allow customized summaries
   */
  public PopulateApprovalRequestSummariesAdapter(X x, ClassInfo of, PopulateApprovalRequestSummariesDAO decorator) {
      super(of);
      x_ = x;
      decorator_ = decorator;
  }

  @Override
  public FObject adapt(FObject source) {
      try {
          ApprovalRequest approvalRequest = (ApprovalRequest) source.fclone();
          // Adds referenceSummary and createdForSummary to ApprovalRequest
          decorator_.populateSummaries(x_, approvalRequest);
          return approvalRequest;
      } catch (Throwable ex) {
          ((Logger) x_.get("logger")).error("Cannot adapt: " + ex.getMessage(), getClass().getSimpleName(), ex);
          return null;
      }
  }

  @Override
  public FObject fastAdapt(FObject source) {
    try {
      var obj = (FObject) of_.newInstance();
      obj.setProperty("id", ((ApprovalRequest) source).getId());
      return obj;
    } catch (Throwable ex) {
      return null;
    }
  }
}