foam.CLASS({
  package: 'net.nanopay.security.snapshooter',
  name: 'RollingJournalTest',
  extends: 'foam.nanos.test.Test',
  flags: ['java'],

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
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

    'net.nanopay.security.snapshooter.RollingJournal',
    'net.nanopay.security.snapshooter.RollingJDAO'
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
        RollingJournal_Put_Remove_Test(x, journal);
        RollingJournal_Replay_Journal_Test(x, journal);
        RollingJournal_Replay_Test(x, journal);
        RollingJournal_Replay_DAO_Test(x, journal);
        RollingJournal_RollJournal_Test(x, journal);
      `
      },
      {
        name: 'deleteImages',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode: `
        // Cleaning up images
        while ( journal.getImageFileNumber() != -1 ) {
          Path file = Paths.get(System.getProperty("JOURNAL_HOME") + "/image." + journal.getImageFileNumber());
          try { Files.delete(file); }
          catch (Throwable t) {
            test(false, "Couldn't delete image file. " + t);
          };
        }
        `
      },
      {
        name: 'deleteJournals',
        args: [
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode: `
        // Cleaning up journals
        while ( journal.getNextJournalNumber() != 0 ) {
          Path file = Paths.get(System.getProperty("JOURNAL_HOME") + "/journal." + (journal.getNextJournalNumber() - 1));
          try { Files.delete(file); }
          catch (Throwable t) {
            test(false, "Couldn't delete image file. " + t);
          };
        }
        Path file = Paths.get(System.getProperty("JOURNAL_HOME") + "/journal." + journal.getNextJournalNumber());
        try { Files.delete(file); } catch (Throwable t) { };
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

          try { Files.delete(file); } catch (Throwable t) { };

          lines = Arrays.asList("The D-Train testing underway...");
          file = Paths.get(System.getProperty("JOURNAL_HOME") + "/image.42");
          try {
            Files.write(file, lines, Charset.forName("UTF-8"));
          } catch (Throwable t) {
            System.err.println("RollingJournalTest :: Couldn't write to image.42!");
          }

          test(journal.getImageFileNumber() == 42, "The correct image number is being picked at 42.");

          try { Files.delete(file); } catch (Throwable t) { };
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
          try { Files.delete(Paths.get(System.getProperty("JOURNAL_HOME") + "/journal.42")); } catch (Throwable t) { };
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
          test(journal.isJournalImpure() == false, "The journal is pure on startup.");

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

            try {
              Thread.sleep(50);
            } catch (Throwable t) { }

            try (BufferedReader reader = new BufferedReader(new FileReader(new File(System.getProperty("JOURNAL_HOME") + "/image.dump")))) {
              String line = reader.readLine();
              test(testString.equals(line), "Images are correctly being written to.");
            } catch ( Throwable t ) {
              test(false, "Images are incorrectly being written to. " + t);
            }
          } catch (Throwable t) {
            test(false, "The imageWriter should not be throwing an error when writing to disk.");
          }

          try { // cleaning up
            imageDumpFile.delete();
          } catch (Throwable t) { }
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

          java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);

          journal.DAOImageDump("dhirenDAO", dhirenDAO, latch);

          // wait for the DAOImageDump thread to complete reading
          try {
            latch.await();
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
            name: 'x',
            javaType: 'X'
          },
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          //Force journal rolling for testing to clean the file
          journal.rollJournal(x);

          DAO dhirenDAODelegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
          DAO dhirenDAO = new RollingJDAO(x, "dhirenDAO", dhirenDAODelegate, journal);

          for ( int n = 0 ; n < 10 ; n++ )
            dhirenDAO.put(new foam.nanos.auth.User.Builder(x).setId(n).setFirstName("Dhiren").setLastName("Audich").build());

          try (BufferedReader reader = new BufferedReader(new FileReader(new File(System.getProperty("JOURNAL_HOME") + "/journal." + journal.getJournalNumber())))) {
            String line;

            boolean check = false;
            for ( int n = 0 ; n < 10 ; n++ ) {
              line = reader.readLine();
              String t = "p({\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":" + n + ",\\"firstName\\":\\"Dhiren\\",\\"lastName\\":\\"Audich\\"})";
              check = t.equals(line);
            }
            test(check, "DAO records are being put into journal correctly.");
          } catch ( Throwable t ) {
            test(false, "Couldn't write to the journal file journal. " + t);
          }

          //Force journal rolling for testing to clean the file
          journal.rollJournal(x);

          for ( int n = 0 ; n < 10 ; n++ )
            dhirenDAO.put(new foam.nanos.auth.User.Builder(x).setId(n).setFirstName("Dhiren").setLastName("Audich").build());

          dhirenDAO.put_(x, (FObject) new foam.nanos.auth.User.Builder(x).setId(1).setFirstName("Dhiren").setLastName("Audichya").build());

          try (BufferedReader reader = new BufferedReader(new FileReader(new File(System.getProperty("JOURNAL_HOME") + "/journal." + journal.getJournalNumber())))) {
            String line;

            boolean check = false;
            for ( int n = 0 ; n < 10 ; n++ ) {
              line = reader.readLine();
              if ( line != null ) {
                String t = "p({\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":1,\\"lastName\\":\\"Audichya\\"})";
                check = t.equals(line);
              }
            }
            test(check, "Only the diff of the record should be put_ into the journal.");
          } catch ( Throwable t ) {
            test(false, "Couldn't write to the journal file journal. " + t);
          }

          //Force journal rolling for testing to clean the file
          journal.rollJournal(x);

          for ( int n = 0 ; n < 10 ; n++ )
            dhirenDAO.remove(new foam.nanos.auth.User.Builder(x).setId(n).setFirstName("Dhiren").setLastName("Audich").build());

          try (BufferedReader reader = new BufferedReader(new FileReader(new File(System.getProperty("JOURNAL_HOME") + "/journal." + journal.getJournalNumber())))) {
            String line;

            boolean check = false;
            for ( int n = 0 ; n < 10 ; n++ ) {
              line = reader.readLine();
              String t = "r({\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":" + n + "})";
              check = t.equals(line);
            }
            test(check, "DAO records are being removed correctly from the journal.");
          } catch ( Throwable t ) {
            test(false, "Couldn't write to the journal file journal. " + t);
          }

          //Force journal rolling for testing to clean the file
          journal.rollJournal(x);

          journal.daoLock_ = true;
          java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(2);

          Thread put = new Thread() {
            @Override
            public void run() {
              dhirenDAO.put(new foam.nanos.auth.User.Builder(x).setId(007).setFirstName("Dhiren").setLastName("Audich").build());
              latch.countDown();
            }
          };
          put.start();

          Thread remove = new Thread() {
            @Override
            public void run() {
              dhirenDAO.remove(new foam.nanos.auth.User.Builder(x).setId(007).setFirstName("Dhiren").setLastName("Audich").build());
              latch.countDown();
            }
          };
          remove.start();

          try (BufferedReader reader = new BufferedReader(new FileReader(new File(System.getProperty("JOURNAL_HOME") + "/journal." + journal.getJournalNumber())))) {
            String line;

            boolean check = false;
            for ( int n = 0 ; n < 2 ; n++ ) {
              line = reader.readLine();
              check = line == null;
            }
            test(check, "The journal must be blocked whilst rolling lock is true.");
          } catch ( Throwable t ) {
            test(false, "Couldn't write to the journal file journal. " + t);
          }

          journal.daoLock_ = false;

          try {
            latch.await();
          } catch (Throwable t) { }

          try (BufferedReader reader = new BufferedReader(new FileReader(new File(System.getProperty("JOURNAL_HOME") + "/journal." + journal.getJournalNumber())))) {
            String line;

            boolean check = false;
            for ( int n = 0 ; n < 2 ; n++ ) {
              line = reader.readLine();
              check = line != null;
            }
            test(check, "The journal should write the records once the rolling lock is false.");
          } catch ( Throwable t ) {
            test(false, "Couldn't write to the journal file journal. " + t);
          }
        `
      },
      {
        name: 'RollingJournal_Replay_Journal_Test',
        args: [
          {
            name: 'x',
            javaType: 'X'
          },
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          //Force journal rolling for testing to clean the file
          journal.rollJournal(x);

          DAO nanopayDAODelegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
          DAO nanopayDAO = new RollingJDAO(x, "nanopayDAO", nanopayDAODelegate, journal);

          try (BufferedWriter writer = new BufferedWriter(new FileWriter(System.getProperty("JOURNAL_HOME") + "/journal." + journal.getJournalNumber()), 16 * 1024)) {
            for ( int n = 0 ; n < 10 ; n++ ) {
              writer.write("nanopayDAO.p({\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":" + n + ",\\"firstName\\":\\"Dhiren\\",\\"lastName\\":\\"Audich\\"})");
              writer.newLine();
              writer.flush();
            }
          } catch ( Throwable t ) {
            test(false, "Writing directly to the journal should not be throwing errors. " + t);
          }

          try {
            journal.replayJournal(x, "journal." + journal.getJournalNumber());
            test(! journal.imageDAOMap_.isEmpty(), "ReplayJournal successfully replayed the journal.");
          } catch (Throwable t) {
            test(false, "ReplayJournal should not be throwing errors for valid parameters.");
          }

          journal.replayDAO("nanopayDAO", nanopayDAO);

          foam.mlang.sink.Count count = new foam.mlang.sink.Count();
          count = (foam.mlang.sink.Count) nanopayDAO.select(count);
          test(count.getValue() == 10, "The count should be 10 after replaying the journal.");

          try {
            journal.replayJournal(x, "journal.049");
            test(false, "ReplayJournal should be throwing errors for invalid files.");
          } catch (Throwable t) {
            test(true, "ReplayJournal should be throwing errors for invalid files.");
          }
        `
      },
      {
        name: 'RollingJournal_Replay_Test',
        args: [
          {
            name: 'x',
            javaType: 'X'
          },
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          deleteImages(journal);
          deleteJournals(journal);

          // Test for reading missing image files
          try {
            journal.replay(x, null);
            test(true && ! journal.journalReplayed_, "When no image file present, replay should return with no error.");
          } catch ( Throwable t ) {
            test(false, "When no image file present, replay should return with no error.");
          }

          // Test for reading missing journal file
          List<String> lines = Arrays.asList("dhirenDAO.p({\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":1,\\"lastName\\":\\"Audich\\"})", "audichDAO.p({\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":2,\\"lastName\\":\\"Audich\\"})");
          Path file = Paths.get(System.getProperty("JOURNAL_HOME") + "/image.0");
          try {
            Files.write(file, lines, Charset.forName("UTF-8"));
          } catch (Throwable t) {
            test(false, "Error shouldn't be thrown trying to write to image.0");
          }

          try {
            journal.replay(x, null);
            test(false, "When no journal file present, replay should throw an exception.");
          } catch ( Throwable t ) {
            test(true && !journal.journalReplayed_, "When no journal file present, replay should throw and exception.");
          }

          // Testing if the records are actually being read

          // Because we are manually manipulating the files
          journal.setJournalNumber(1);

          lines = Arrays.asList("audichDAO.p({\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":1,\\"lastName\\":\\"Audich\\"})", "dhirenDAO.p({\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":2,\\"lastName\\":\\"Audich\\"})");
          file = Paths.get(System.getProperty("JOURNAL_HOME") + "/journal.1");
          try {
            Files.write(file, lines, Charset.forName("UTF-8"));
          } catch (Throwable t) {
            test(false, "Error shouldn't be thrown trying to write to image.0");
          }

          try {
            journal.replay(x, null);
            test(journal.journalReplayed_ && journal.imageDAOMap_.size() == 2, "Both the image and the journal are replayed on replay correctly.");
          } catch ( Throwable t ) {
            test(false, "Replay shouldn't be throwing errors when both journals are present.");
          }

          try {
            test(Files.size(Paths.get(System.getProperty("JOURNAL_HOME") + "/journal.2")) == 0 &&
              Files.size(Paths.get(System.getProperty("JOURNAL_HOME") + "/image.1")) != 0,
              "The journal was rolled after replay.");
          } catch (Throwable t) {
            test(false, "The journals were not rolled after the replay.");
          }
        `
      },
      {
        name: 'RollingJournal_Replay_DAO_Test',
        args: [
          {
            name: 'x',
            javaType: 'X'
          },
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          // Deleting the rolled journal files
          try {
            Files.delete(Paths.get(System.getProperty("JOURNAL_HOME") + "/journal.2"));
            Files.delete(Paths.get(System.getProperty("JOURNAL_HOME") + "/image.1"));
          } catch (Throwable t) {
            test(false, "Could not delete the files.");
          }

          // Cleaning up any old mapping that might exist
          journal.imageDAOMap_.clear();

          // Replaying journals
          journal.journalReplayed_ = false;
          journal.replay(x, null);

          DAO nullDAODelegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
          journal.replayDAO("nullDAO", nullDAODelegate);
          foam.mlang.sink.Count count = new foam.mlang.sink.Count();
          count = (foam.mlang.sink.Count) nullDAODelegate.select(count);
          test(count.getValue() == 0, "The DAO should is empty for trying to replay services that don't exist.");

          DAO dhirenDAODelegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
          DAO dhirenDAO = new RollingJDAO(x, "dhirenDAO", dhirenDAODelegate, journal);
          count = new foam.mlang.sink.Count();
          count = (foam.mlang.sink.Count) dhirenDAODelegate.select(count);
          test(count.getValue() == 2, "The DAO should have 2 records replayed from the image journal.");

          DAO audichDAODelegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
          DAO audichDAO = new RollingJDAO(x, "audichDAO", audichDAODelegate, journal);
          count = new foam.mlang.sink.Count();
          count = (foam.mlang.sink.Count) audichDAODelegate.select(count);
          test(count.getValue() == 2, "The DAO should have 2 records replayed from the last journal.");
        `
      },
      {
        name: 'RollingJournal_RollJournal_Test',
        args: [
          {
            name: 'x',
            javaType: 'X'
          },
          {
            class: 'FObjectProperty',
            of: 'net.nanopay.security.snapshooter.RollingJournal',
            name: 'journal'
          }
        ],
        javaCode:`
          deleteJournals(journal);
          deleteImages(journal);

          // Cleaning up any old mapping that might exist
          journal.imageDAOMap_.clear();
          journal.setJournalNumber(0);

          /\* Reset counters. */\
          journal.setImpurityLevel(0);
          journal.setTotalRecords(0);

          // Replaying journals
          journal.journalReplayed_ = false;

          journal.rollJournal(x);

          try {
            Thread.sleep(50);
          } catch (Throwable t) { }

          try {
            test(Files.size(Paths.get(System.getProperty("JOURNAL_HOME") + "/journal.1")) == 0 &&
              Files.size(Paths.get(System.getProperty("JOURNAL_HOME") + "/image.0")) != 0,
              "The image and the journal files should exist after rolling with the correct extension.");
          } catch (Throwable t) {
            test(false, "The image and the journal files should exist after rolling with the correct extension.");
          }

          journal.setJournalNumber(999999);
          journal.rollJournal(x);

          try {
            Thread.sleep(50);
          } catch (Throwable t) { }

          try {
            test(Files.size(Paths.get(System.getProperty("JOURNAL_HOME") + "/journal.1000000")) == 0 &&
              Files.size(Paths.get(System.getProperty("JOURNAL_HOME") + "/image.999999")) != 0,
              "The image and the journal files should exist after the second roll with the correct extension.");
          } catch (Throwable t) {
            test(false, "The image and the journal files should exist after rolling with the correct extension.");
          }

        `
      }
  ]
});
