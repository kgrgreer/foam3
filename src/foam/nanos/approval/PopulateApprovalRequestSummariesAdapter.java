/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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