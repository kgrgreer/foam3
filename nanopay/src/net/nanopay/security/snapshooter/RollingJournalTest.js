foam.CLASS({
  package: 'net.nanopay.security.snapshooter',
  name: 'RollingJournalTest',
  extends: 'foam.nanos.test.Test',
  flags: ['java'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',

    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.FileReader',
    'java.io.FileWriter',
    'java.io.File',
    'java.nio.charset.Charset',
    'java.nio.file.Files',
    'java.nio.file.Path',
    'java.nio.file.Paths',
    'java.util.Arrays',
    'java.util.List',

    'net.nanopay.security.snapshooter.RollingJournal'
  ],

  documentation: 'Testing the snapshot system with rolling journals and RollingJDAO.',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        RollingJournal journal = (RollingJournal) x.get("RollingJournal");

        RollingJournal_Next_Journal_Name_Test(journal);
        RollingJournal_Next_Image_Name_Test(journal);
        RollingJournal_Next_Journal_Test(journal);
        RollingJournal_Journal_Impurity_Test(journal);
        RollingJournal_Increment_Record_Test(journal);
        RollingJournal_Create_Journal_Test(journal);
        RollingJournal_Rename_Journal_Test(journal);
        RollingJournal_Image_Writer_Test(journal);
        RollingJournal_DAOImageDump_Test(journal);
        RollingJournal_Put_Remove_Test(journal);
//        RollingJournal_RollJournal_Test();
//        RollingJournal_Replay_Test();

//        foam.dao.DAO userDAODelegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
//
//        x = x.put("userDAO", userDAODelegate);
//
//        foam.dao.DAO userDAO = new net.nanopay.security.snapshooter.RollingJDAO.Builder(x)
//         .setService("userDAO")
//         .setOf(foam.nanos.auth.User.getOwnClassInfo())
//         .setDelegate(userDAODelegate)
//         .setJournal(journal)
//         .build();
//
//        foam.dao.DAO groupDAODelegate = new foam.dao.MDAO(foam.nanos.auth.Group.getOwnClassInfo());
//
//        x = x.put("groupDAO", groupDAODelegate);
//
//        foam.dao.DAO groupDAO = new net.nanopay.security.snapshooter.RollingJDAO.Builder(x)
//         .setService("groupDAO")
//         .setOf(foam.nanos.auth.Group.getOwnClassInfo())
//         .setDelegate(groupDAODelegate)
//         .setJournal(journal)
//         .build();
//
//        for ( int i = 0; i < 5; i++ ){
//         userDAO.put(new foam.nanos.auth.User.Builder(x).setId(1000).setFirstName("Dhiren").setLastName("Audich").build());
//         groupDAO.put(new foam.nanos.auth.Group.Builder(x).setId("admin").setEnabled(true).build());
//        }
//
//        userDAO.put(new foam.nanos.auth.User.Builder(x).setId(1000).setFirstName("Dhiren").setLastName("Audichya").build());
//
//        for ( int i = 0; i < 8; i++ ){
//         userDAO.put(new foam.nanos.auth.User.Builder(x).setId(1001+i).setFirstName("Dhiren").setLastName("Audich").build());
//        }
//
//        journal.setTotalRecords(4300000000L);
//        journal.setImpurityLevel(3655000000L);
//
//        for ( int i = 0; i < 9; i++ ){
//         userDAO.remove(userDAO.find(1000+i));
//        }

//        // check if the last journal file number is being picked up
//        java.io.File file = null;
//        try {
//          file = java.io.File.createTempFile("journal", "tmp");
//        } catch ( Throwable t ) {
//          throw new RuntimeException(t);
//        }
//
//        foam.dao.DAO userDAODelegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
//        foam.dao.DAO groupDAODelegate = new foam.dao.MDAO(foam.nanos.auth.Group.getOwnClassInfo());
//
//        x = x.put("userDAO", userDAODelegate);
//        x = x.put("groupDAO", groupDAODelegate);
//
//        foam.dao.Journal journal = new foam.dao.RoutingJournal.Builder(x).setFile(file).build();
//        foam.dao.DAO userDAO = new foam.dao.RoutingJDAO.Builder(x)
//          .setService("userDAO")
//          .setOf(foam.nanos.auth.User.getOwnClassInfo())
//          .setDelegate(userDAODelegate)
//          .setJournal(journal)
//          .build();
//
//        foam.dao.DAO groupDAO = new foam.dao.RoutingJDAO.Builder(x)
//          .setService("groupDAO")
//          .setOf(foam.nanos.auth.Group.getOwnClassInfo())
//          .setDelegate(groupDAODelegate)
//          .setJournal(journal)
//          .build();
//
//        userDAO.put(new foam.nanos.auth.User.Builder(x).setId(1000).setFirstName("Kirk").setLastName("Eaton").build());
//        groupDAO.put(new foam.nanos.auth.Group.Builder(x).setId("admin").setEnabled(true).build());
//
//        // check to see that lines are correctly output
//        try ( java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(file)) ) {
//          boolean match = true;
//          for ( String line ; ( line = reader.readLine() ) != null ; ) {
//            if ( foam.util.SafetyUtil.isEmpty(line) ) continue;
//            match = USER_DAO_PUT.equals(line) || GROUP_DAO_PUT.equals(line);
//          }
//
//          test(match, "RoutingJournal correctly outputs expected lines");
//        } catch ( Throwable t ) {
//          throw new RuntimeException(t);
//        }
//
//        // verify userdao after put
//        VerifyUserDAO(userDAO);
//        // verify groupdao after put
//        VerifyGroupDAO(groupDAO);
//
//        // empty daos
//        userDAODelegate.removeAll();
//        groupDAODelegate.removeAll();
//
//        foam.mlang.sink.Count count = new foam.mlang.sink.Count();
//        count = (foam.mlang.sink.Count) userDAO.select(count);
//        test(count.getValue() == 0, "UserDAO is empty");
//
//        count = new foam.mlang.sink.Count();
//        count = (foam.mlang.sink.Count) groupDAO.select(count);
//        test(count.getValue() == 0, "GroupDAO is empty");
//
//        journal.replay(x, new foam.dao.NullDAO());
//
//        // verify userDAO after replay
//        VerifyUserDAO(userDAO);
//        // verify groupDAO after replay
//        VerifyGroupDAO(groupDAO);
      `
      },
      {
        name: 'RollingJournal_Next_Journal_Name_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          test(journal.getNextJournalNumber() == 0, "The correct journal number is being picked up at startup- 0.");

          List<String> lines = Arrays.asList("The D-Train testing underway...");
          Path file = Paths.get(System.getProperty("JOURNAL_HOME") + "/journal.42");
          try {
            Files.write(file, lines, Charset.forName("UTF-8"));
          } catch (Throwable t) {
            System.err.println("RollingJournalTest :: Couldn't write to journal.42!");
          }

          test(journal.getNextJournalNumber() == 43, "The correct journal number is being picked up after 42- 43.");
        `
      },
      {
        name: 'RollingJournal_Next_Image_Name_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          test(journal.getImageFileNumber() == -1, "The correct image number is being picked up when no image exists- -1.");

          List<String> lines = Arrays.asList("The D-Train testing underway...");
          Path file = Paths.get(System.getProperty("JOURNAL_HOME") + "/image.0");
          try {
            Files.write(file, lines, Charset.forName("UTF-8"));
          } catch (Throwable t) {
            System.err.println("RollingJournalTest :: Couldn't write to image.0!");
          }

          test(journal.getImageFileNumber() == 0, "The correct image number is being picked up at startup- 0.");

          lines = Arrays.asList("The D-Train testing underway...");
          file = Paths.get(System.getProperty("JOURNAL_HOME") + "/image.42");
          try {
            Files.write(file, lines, Charset.forName("UTF-8"));
          } catch (Throwable t) {
            System.err.println("RollingJournalTest :: Couldn't write to image.42!");
          }

          test(journal.getImageFileNumber() == 42, "The correct image number is being picked at 42.");
        `
      },
      {
        name: 'RollingJournal_Next_Journal_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          test("journal.43".equals(journal.getNextJournal().getName()), "The correct journal is being returned by getNextJournal.");
        `
      },
      {
        name: 'RollingJournal_Journal_Impurity_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          try {
            test(journal.isJournalImpure() == false, "The journal is pure on startup.");
          } catch (Throwable t) {
            System.out.println("Dhiren debug: "+t);
          }

          journal.setTotalRecords(journal.MIN_RECORDS);
          journal.setImpurityLevel((long) (journal.MIN_RECORDS * journal.IMPURITY_THRESHOLD));

          test(journal.isJournalImpure() == false, "The journal is impure upto " + journal.MIN_RECORDS + " records and impurity level of " + journal.IMPURITY_THRESHOLD + ".");

          journal.setImpurityLevel(journal.getImpurityLevel() + 1);
          test(journal.isJournalImpure() == true, "The journal is impure after " + journal.MIN_RECORDS + " records and impurity level of " + journal.IMPURITY_THRESHOLD + ".");
        `
      },
      {
        name: 'RollingJournal_Increment_Record_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          journal.setTotalRecords(0);
          journal.setImpurityLevel(0);

          journal.incrementRecord(false);

          test(journal.getTotalRecords() == 1 &&
            journal.getImpurityLevel() == 0, "The total records is incremented correctly without impurity.");

          journal.incrementRecord(true);

          test(journal.getTotalRecords() == 2 &&
            journal.getImpurityLevel() == 1, "The total records is incremented correctly with impurity.");
        `
      },
      {
        name: 'RollingJournal_Create_Journal_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          File testJournal = journal.createJournal("test.run");
          File errorTest = null;

          try {
            errorTest = journal.createJournal("test.run");
            test(false, "Exception is not being thrown when trying to create a journal that already exists.");
          } catch (Throwable t) {
            test(true, "Exception is correctly being thrown when trying to create a journal that already exists.");
          }

          if ( errorTest == null )
            test(testJournal != null, "A new journal was successfully created.");
          else
            test(false, "A new journal was not created.");
        `
      },
      {
        name: 'RollingJournal_Rename_Journal_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          File testJournal = journal.createJournal("rename.me");

          try {
            journal.renameJournal(testJournal, null);
            test(false, "Exception is not being thrown when trying to rename a journal with an null name.");
          } catch (Throwable t) {
            test(true, "Exception is correctly being thrown when trying to rename a journal with a null name.");
          }

          try {
            journal.renameJournal(testJournal, "");
            test(false, "Exception is not being thrown when trying to rename a journal with an empty name.");
          } catch (Throwable t) {
            test(true, "Exception is correctly being thrown when trying to rename a journal with an empty name.");
          }

          try {
            journal.renameJournal(testJournal, "renamed.you");
            test(true, "Journal is correctly being renamed with a valid name.");
          } catch (Throwable t) {
            test(false, "Exception is incorrectly being thrown when trying to rename a journal with a valid name.");
          }
        `
      },
      {
        name: 'RollingJournal_Image_Writer_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          String testString = "this is a test dummy .. er .. I mean dummy test :P";
          journal.imageWriterQueue_.offer(testString);

          journal.setWriteImage(true);

          String imageName = "image.dump";
          File imageDumpFile = journal.createJournal(imageName);
          try {
            BufferedWriter writer = new BufferedWriter(new FileWriter(imageDumpFile), 16 * 1024);
            journal.setWriter(writer);
            test(true, "Writer set correctly.");
          } catch ( Throwable t ) {
            test(false, "Failed to set writer " + t);
          }

          try {
            journal.imageWriter();
            journal.setWriteImage(false);
            try(BufferedReader reader = new BufferedReader(new FileReader(new File(System.getProperty("JOURNAL_HOME") + "/image.dump")))) {
              String line = reader.readLine();
              test(testString.equals(line), "Images are correctly being written to.");
            } catch ( Throwable t ) {
              test(false, "Images are incorrectly being written to. " + t);
            }
          } catch (Throwable t) {
            test(false, "The imageWriter should not be throwing an error when writing to disk.");
          }
        `
      },
      {
        name: 'RollingJournal_DAOImageDump_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          DAO dhirenDAO = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());

          for ( int x = 0 ; x < 10 ; x++ )
            dhirenDAO.put(new foam.nanos.auth.User.Builder(getX()).setId(x).setFirstName("Dhiren").setLastName("Audich").build());

          journal.DAOImageDump("dhirenDAO", dhirenDAO, new java.util.concurrent.CountDownLatch(1));

          // wait for the DAOImageDump thread to complete reading
          try {
            Thread.sleep(50);
          } catch (Throwable t) { }

          boolean check = false;
          for ( int x = 0 ; x < 10 ; x++ ) {
            String t = "dhirenDAO.p({\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":" + x + ",\\"firstName\\":\\"Dhiren\\",\\"lastName\\":\\"Audich\\"})";
            check = t.equals(journal.imageWriterQueue_.poll());
          }
          test(check, "DAO records are being dumped into the imageWriterQueue correctly.");
        `
      },
      {
        name: 'RollingJournal_Put_Remove_Test',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`

        `
      }
  ]
});
