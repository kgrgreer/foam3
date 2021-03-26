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
    package: 'net.nanopay.meter.report',
    name: 'BusinessSummaryReportDAO',
    extends: 'foam.dao.ProxyDAO',

    documentation: `A DAO decorator to generate the business summary report
        for leadership`,

    javaImports: [
      'foam.core.Detachable',
      'foam.core.X',
      'foam.dao.AbstractSink',
      'foam.dao.ArraySink',
      'foam.dao.DAO',
      'foam.dao.MDAO',
      'foam.dao.Sink',
      'foam.mlang.sink.Count',
      'foam.mlang.sink.Map',
      'net.nanopay.account.Account',
      'net.nanopay.admin.model.ComplianceStatus',
      'net.nanopay.admin.model.AccountStatus',
      'net.nanopay.meter.report.BusinessSummaryReport',
      'net.nanopay.meter.reports.RowOfBusSumReports',
      'net.nanopay.model.Business',
      'net.nanopay.tx.model.Transaction',
      'foam.nanos.auth.LifecycleState',

      'static foam.mlang.MLang.*',
      'java.util.*'
    ],

    methods: [
      {
        name: 'countDaily',
        documentation: 'countDaily -> createdDate == today',
        type: 'long',
        args: [
          { type: 'DAO', name: 'businesses' }
        ],
        javaCode: `
          Date currentDate = new Date();
          Calendar c = Calendar.getInstance();
          c.setTime(currentDate);
          c.set(Calendar.HOUR, 0);
          c.set(Calendar.MINUTE, 0);
          c.set(Calendar.SECOND, 0);
          Date today = c.getTime();
          Count count = (Count) businesses.where(
            GTE(Business.CREATED, today)
          ).select(new Count());
          return count.getValue();
        `
      },
      {
        name: 'countYesterday',
        documentation: 'countYesterday -> createdDate == yesterday',
        type: 'long',
        args: [
          { type: 'DAO', name: 'businesses' }
        ],
        javaCode: `
          Date currentDate = new Date();
          Calendar c = Calendar.getInstance();
          c.setTime(currentDate);
          c.set(Calendar.HOUR, 0);
          c.set(Calendar.MINUTE, 0);
          c.set(Calendar.SECOND, 0);
          Date today = c.getTime();
          c.add(Calendar.DATE, -1);
          Date yesterday = c.getTime();
          Count count = (Count) businesses.where(
            AND(
              GTE(Business.CREATED, yesterday),
              LT(Business.CREATED, today))
          ).select(new Count());
          return count.getValue();
        `
      },
      {
        name: 'countWeekly',
        documentation: 'countWeekly -> createdDate in last 6 days + today',
        type: 'long',
        args: [
          { type: 'DAO', name: 'businesses' }
        ],
        javaCode: `
          Date currentDate = new Date();
          Calendar c = Calendar.getInstance();
          c.setTime(currentDate);
          c.add(Calendar.DATE, -6);
          c.set(Calendar.HOUR, 0);
          c.set(Calendar.MINUTE, 0);
          c.set(Calendar.SECOND, 0);
          Date sevenDaysBefore = c.getTime();
          Count count = (Count) businesses.where(
            GTE(Business.CREATED, sevenDaysBefore)
          ).select(new Count());
          return count.getValue();
        `
      },
      {
        name: 'countMonthToDate',
        documentation: 'countMonthToDate -> createdDate in current month',
        type: 'long',
        args: [
          { type: 'DAO', name: 'businesses' }
        ],
        javaCode: `
          Date currentDate = new Date();
          Calendar c = Calendar.getInstance();
          c.setTime(currentDate);
          c.set(Calendar.DATE, 1);
          c.set(Calendar.HOUR, 0);
          c.set(Calendar.MINUTE, 0);
          c.set(Calendar.SECOND, 0);
          Date firstDayOfMonth = c.getTime();
          Count count = (Count) businesses.where(
            GTE(Business.CREATED, firstDayOfMonth)
          ).select(new Count());
          return count.getValue();
        `
      },
      {
        name: 'countLastMonth',
        documentation: 'countLastMonth -> createdDate in previous month',
        type: 'long',
        args: [
          { type: 'DAO', name: 'businesses' }
        ],
        javaCode: `
          Date currentDate = new Date();
          Calendar c = Calendar.getInstance();
          c.setTime(currentDate);
          c.set(Calendar.DATE, 1);
          c.set(Calendar.HOUR, 0);
          c.set(Calendar.MINUTE, 0);
          c.set(Calendar.SECOND, 0);
          Date thisMonth = c.getTime();
          c.add(Calendar.MONTH, -1);
          Date lastMonth = c.getTime();
          Count count = (Count) businesses.where(
            AND(
              GTE(Business.CREATED, lastMonth),
              LT(Business.CREATED, thisMonth))
          ).select(new Count());
          return count.getValue();
        `
      },
      {
        name: 'countYearToDate',
        documentation: 'countYearToDate -> createdDate in current calendar year',
        type: 'long',
        args: [
          { type: 'DAO', name: 'businesses' }
        ],
        javaCode: `
          Date currentDate = new Date();
          Calendar c = Calendar.getInstance();
          c.setTime(currentDate);
          c.set(Calendar.MONTH, 1);
          c.set(Calendar.DATE, 1);
          c.set(Calendar.HOUR, 0);
          c.set(Calendar.MINUTE, 0);
          c.set(Calendar.SECOND, 0);
          Date thisYear = c.getTime();
          Count count = (Count) businesses.where(
            GTE(Business.CREATED, thisYear)
          ).select(new Count());
          return count.getValue();
        `
      },
      {
        name: 'countToSummary',
        type: 'BusinessSummaryReport',
        args: [
          { type: 'Context', name: 'x' },
          { type: 'DAO', name: 'businesses' },
          { type: 'RowOfBusSumReports', name: 'row' }
        ],
        javaCode: `
          BusinessSummaryReport bst = new BusinessSummaryReport.Builder(x)
            .setId(row.ordinal())
            .setTypeDate(row.getLabel())
            .setDaily(countDaily(businesses))
            .setYesterday(countYesterday(businesses))
            .setWeekly(countWeekly(businesses))
            .setMonthToDate(countMonthToDate(businesses))
            .setLastMonth(countLastMonth(businesses))
            .setYearToDate(countYearToDate(businesses))
            .setTotal(((Count) businesses.select(new Count())).getValue())
            .build();
          return bst;
        `
      },
      {
        name: 'select_',
        javaCode: `
          if ( sink == null )
            return super.select_(x, sink, skip, limit, order, predicate);

          Sink decoratedSink = decorateSink(x, sink, skip, limit, order, predicate);

          // Retrieve the DAO
          DAO businessDAO = (DAO) x.get("businessDAO");


          // Registration (business created AND Compliance = "Pending")
          DAO businesses = businessDAO.where(
            EQ(Business.COMPLIANCE, ComplianceStatus.NOTREQUESTED)
          );
          decoratedSink.put(countToSummary(
            x,
            businesses,
            RowOfBusSumReports.REGISTRATION
          ), null);


          // Application Submitted (Compliance = "Submitted" AND Onboarding is checked)
          businesses = businessDAO.where(
            AND(
              EQ(Business.COMPLIANCE, ComplianceStatus.REQUESTED),
              EQ(Business.ONBOARDED, true)
            )
          );
          decoratedSink.put(countToSummary(
            x,
            businesses,
            RowOfBusSumReports.APPLICATION_SUBMITTED
          ), null);


          // Approved (Compliance = "Approved" AND Status = "Active", Onboarding is checked)
          businesses = businessDAO.where(
            AND(
              EQ(Business.COMPLIANCE, ComplianceStatus.PASSED),
              EQ(Business.LIFECYCLE_STATE, LifecycleState.ACTIVE),
              EQ(Business.ONBOARDED, true)
            )
          );
          decoratedSink.put(countToSummary(
            x,
            businesses,
            RowOfBusSumReports.APPROVED
          ), null);

          // Active (If Approved AND at least 1 payment created in the last 30 days)
          DAO transactionDAO = (DAO) x.get("localTransactionDAO");
          List busLst = ((ArraySink) businessDAO.where(
            EQ(Business.COMPLIANCE, ComplianceStatus.PASSED)
          ).select(new ArraySink())).getArray();

          // get the date 30 days before
          Date currentDate = new Date();
          Calendar c = Calendar.getInstance();
          c.setTime(currentDate);
          c.add(Calendar.DATE, -30);
          Date lastMonthDate = c.getTime();
          // create an empty DAO to convert list to DAO
          businesses = new MDAO(Business.getOwnClassInfo());
          // select accounts under the business
          DAO accountDAO = (DAO) x.get("localAccountDAO");
          for (Object obj : busLst) {
            Business business = (Business) obj;

            Map map = new Map.Builder(x)
              .setArg1(Account.ID)
              .setDelegate(new ArraySink())
              .build();
            accountDAO.where(EQ(Account.OWNER, business.getId())).select(map);
            List accounts = ((ArraySink) map.getDelegate()).getArray();
            boolean active = (transactionDAO.find(
              AND(
                GTE(Transaction.CREATED, lastMonthDate),
                IN(Transaction.SOURCE_ACCOUNT, accounts)
              )
            ) != null);
            if (active) {
              businesses.put(business);
            }
          }
          decoratedSink.put(countToSummary(
            x,
            businesses,
            RowOfBusSumReports.ACTIVE
          ), null);


          // Declined (Compliance ="Failed")
          businesses = businessDAO.where(
            EQ(Business.COMPLIANCE, ComplianceStatus.FAILED)
          );
          decoratedSink.put(countToSummary(
            x,
            businesses,
            RowOfBusSumReports.DECLINED
          ), null);


          // Locked (Status = "Revoked")
          businesses = businessDAO.where(
            EQ(Business.STATUS, AccountStatus.REVOKED)
          );
          decoratedSink.put(countToSummary(
            x,
            businesses,
            RowOfBusSumReports.LOCKED
          ), null);

          return sink;
        `
      }
    ]
  });

