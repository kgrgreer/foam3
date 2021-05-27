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
package net.nanopay.ticket;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static foam.mlang.MLang.*;

public class AutoTimeoutRefundCron implements ContextAgent {

  @Override
  public void execute(X x) {
    // This cron automatically refunds transactions addressed by tickets in queued refund status.
    // tickets where the autorefund date that is specified on the ticket has passed get refunded.
    Logger logger = (Logger) x.get("logger");
    DAO refundTicketDAO = (DAO) x.get("refundTicketDAO");

    ArraySink sink = (ArraySink) refundTicketDAO
      .where(
          EQ(RefundTicket.REFUND_STATUS, RefundStatus.QUEUED)
      )
      .select(new ArraySink());
    List<RefundTicket> refundTickets = sink.getArray();

    for (RefundTicket ticket : refundTickets) {
      try{
        LocalDateTime auto = ticket.getAutoRefundDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(auto) ) {
          ticket = (RefundTicket) ticket.fclone();
          ticket.setRefundStatus(RefundStatus.APPROVED);
          refundTicketDAO.put(ticket);
        }
      } catch(Throwable t){
        logger.error("Error checking or updating refund ticket: " + ticket.getId(), t);
      }

    }
  }
}
