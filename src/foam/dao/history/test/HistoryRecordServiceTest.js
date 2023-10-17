/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history.test',
  name: 'HistoryRecordServiceTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.history.HistoryRecord',
    'foam.dao.history.HistoryRecordService',
    'foam.dao.history.PropertyUpdate',
    'foam.nanos.auth.User',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.stream.Collectors'
  ],

  messages: [
    { name: "OLD_EMAIL", message: "test_user_1_old@nanopay.net"},
    { name: "NEW_EMAIL", message: "test_user_1_new@nanopay.net"}
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        User testUser1 = null;
        User testUser2 = null;
        DAO userDAO = (DAO) x.get("bareUserDAO");
        DAO userHistoryDAO = (DAO) x.get("userHistoryDAO");
        HistoryRecordService historyRecordService = (HistoryRecordService) x.get("historyRecordService");

        try {
          /****** Setup ******/
  
          // Create test users
          testUser1 = new User.Builder(x)
            .setUserName("test_user1")
            .setPhoneNumber("111-222-3333")
            .build();
          testUser2 = new User.Builder(x).setUserName("test_user2").build();
    
          testUser1 = (User) userDAO.put(testUser1).fclone();
          testUser2 = (User) userDAO.put(testUser2);

          sleep(500);
  
          // Update user1 email
          testUser1.setEmail(OLD_EMAIL);
          testUser1 = (User) userDAO.put(testUser1).fclone();

          sleep(500);
  
          testUser1.setEmail(NEW_EMAIL);
          testUser1 = (User) userDAO.put(testUser1).fclone();

          sleep(500);

          // Update user1 phone number
          testUser1.setPhoneNumber("222-333-4444");

          List<Long> testUserIds = new ArrayList<>();
          testUserIds.add(testUser1.getId());
          testUserIds.add(testUser2.getId());

          /****** End of Setup ******/
  
          /****** Tests ******/
  
          /* getRecord tests */
          
          // 1. Returns the latest record
          HistoryRecord record = historyRecordService.getRecord(x, "userHistoryDAO", "email");
          PropertyUpdate emailUpdate = findPropertyUpdate(record, "email");
          test(record != null &&
            (Long) record.getObjectId() == testUser1.getId() &&
            emailUpdate != null && 
            OLD_EMAIL.equals(emailUpdate.getOldValue()) &&
            NEW_EMAIL.equals(emailUpdate.getNewValue()),
            "getRecord returns the latest record that has 'propertyName' property update");
          
          // 2. Returns null if there is no 'propertyName' property update
          // make property name random so that the data irrelevant to this test don't get included
          record = historyRecordService.getRecord(x, "userHistoryDAO", "blah");
          test(record == null,
            "getRecord returns null if there is no record with 'propertyName' property update");
  
          /* getRecordById tests */
          
          // 1. Returns the latest record with given id if there is 'propertyName' property update 
          record = historyRecordService.getRecordById(x, "userHistoryDAO", testUser1.getId(), "email");
          emailUpdate = findPropertyUpdate(record, "email");
          test(record != null &&
            (Long) record.getObjectId() == testUser1.getId() &&
            emailUpdate != null &&
            OLD_EMAIL.equals(emailUpdate.getOldValue()) &&
            NEW_EMAIL.equals(emailUpdate.getNewValue()),
            "getRecordId returns the latest record with given id and has 'propertyName' property update");
  
          // 2. Returns null if there is no record with given id or 'propertyName' property update
          record = historyRecordService.getRecordById(x, "userHistoryDAO", testUser2.getId(), "email");
          test(record == null,
            "getRecordById returns null if there is no record with given id");
          
          record = historyRecordService.getRecordById(x, "userHistoryDAO", testUser1.getId(), "birthday");
          test(record == null,
            "getRecordById returns null if there is no record with 'propertyName' property update");
  
          /* getRecords tests */
  
          // 1. Returns all the records that have 'propertyName' property update
          List<HistoryRecord> records = historyRecordService.getRecords(x, "userHistoryDAO", "email");
          // filter out all the records irrelevant to the test
          records = filterRecords(records, testUserIds);
          test(records.size() == 2 &&
            findPropertyUpdate(records.get(0), "email") != null &&
            findPropertyUpdate(records.get(1), "email") != null,
            "getRecords returns all the records that have 'propertyName' property update");
          
          // 2. Returns an empty list if there is no record with 'propertyName' property update
          records = historyRecordService.getRecords(x, "userHistoryDAO", "birthday");
          // filter out all the records irrelevant to the test
          records = filterRecords(records, testUserIds);
          test(records.size() == 0,
            "getRecords returns an empty list if there is no record with 'propertyName' property update");
  
          /* getRecordsById tests */
          
          // 1. Returns all the records with given id and have 'propertyName' property update
          records = historyRecordService.getRecordsById(x, "userHistoryDAO", testUser1.getId(), "email");
          test(records.size() == 2 &&
            (Long) records.get(0).getObjectId() == testUser1.getId() &&
            (Long) records.get(1).getObjectId() == testUser1.getId() &&
            findPropertyUpdate(records.get(0), "email") != null &&
            findPropertyUpdate(records.get(1), "email") != null,
            "getRecordId returns all the records with given id and have 'propertyName' property update");
  
          // 2. Returns an empty list if there is no record with given id or if there is no 'propertyName' property update
          records = historyRecordService.getRecordsById(x, "userHistoryDAO", testUser2.getId(), "email");
          test(records.size() == 0,
            "getRecordsById returns an empty list if there is no record with given id");
          
          records = historyRecordService.getRecordsById(x, "userHistoryDAO", testUser1.getId(), "birthday");
          test(records.size() == 0,
            "getRecordsById returns an empty list if there is no 'propertyName' property update");
          
          /****** End of tests ******/

        } finally {
          userDAO.remove(testUser1);
          userDAO.remove(testUser2);
        }
      `
    },
    {
      name: 'findPropertyUpdate',
      visibility: 'private',
      type: 'PropertyUpdate',
      args: 'HistoryRecord record, String propertyName',
      javaCode: `
        if ( record == null ) return null;

        for ( PropertyUpdate update : record.getUpdates() ) {
          if ( update.getName().equals(propertyName) ) return update;
        }
        return null;
      `
    },
    {
      name: 'filterRecords',
      visibility: 'private',
      type: 'List<HistoryRecord>',
      args: 'List<HistoryRecord> records, List<Long> ids',
      documentation: `
        Filters records by given ids and returns a new filtered list of records.
        This is required so that the tests are performed only with the test data 
      `,
      javaCode: `
        return records.stream()
          .filter(record -> ids.contains((Long) record.getObjectId()))
          .collect(Collectors.toList());
      `
    },
    {
      name: 'sleep',
      visibility: 'private',
      args: 'long millis',
      javaCode: `
        try {
          Thread.sleep(millis);
        } catch(InterruptedException e) {}
      `
    }
  ]
});
