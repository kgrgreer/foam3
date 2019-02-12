foam.CLASS({
  package: 'net.nanopay.test',
  name: 'BusinessSectorDAOTest',
  extends: 'foam.nanos.test.Test',
   documentation: `This class tests BusinessSectorDAO - for the purpose of switching service to EasyDAO. 
                  Basic Tests work in 6 steps
                  Step 1: create an object to put into the dao
                  Step 2: do a put(obj) into the testing dao
                  Step 3: do a find(obj)
                  Step 4: test that the find did not return a null
                  Step 5: do a remove(obj)
                  Step 6: test that remove worked by trying to find(obj)`,
   javaImports: [
     'foam.core.X',
     'foam.dao.DAO',
     'net.nanopay.model.BusinessSector',
  ],
   methods: [
  {
      name: 'runTest',
      type: 'Void',
      javaCode: `
      // Objects and Variables
      boolean tester = true;
      DAO businessSectorDAOTest = (DAO) x.get("businessSectorDAO");
      BusinessSector testBS = new BusinessSector();
      long id = 11100111;

      // BusinessSector
      testBS.setId(id);
      testBS.setName("TestSectorBusiness");
      
      // put test
      try {
        businessSectorDAOTest.put(testBS);
      } catch (Exception e) {
        tester = true;
      }
      
      // find test
      BusinessSector test1 = null;
      try {
        test1 = (BusinessSector) businessSectorDAOTest.find(testBS);
        if( test1.getId() != id ) tester = false;
      } catch (Exception e) {
        tester = false;
      }
      
      // remove test
      try {
        businessSectorDAOTest.remove(test1);
      } catch (Exception e) {
        tester = true;
      }
      
       // find 2: confirm remove 
      try {
        BusinessSector test2 = (BusinessSector) businessSectorDAOTest.find(test1);
        if( test2 != null ) tester = false;
      }
      catch (Exception e){
        tester = false;
      }

      test(tester, "businessSectorDAO - put, find, remove test");
        `
      }
    ]
  });
