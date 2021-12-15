/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.demo.relationship.test',
  name: 'RelationshipTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.ArraySink',
    'java.util.ArrayList',
    'java.util.Iterator',
    'java.util.List'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
      //set up
      x = foam.core.EmptyX.instance();

      x = x.put("courseDAO", new foam.dao.EasyDAO.Builder(x).
        setContextualize(true).
        setAuthorize(false).
        setOf(foam.nanos.demo.relationship.Course.getOwnClassInfo()).
        setRuler(false).
        build());

      x = x.put("professorDAO", new foam.dao.EasyDAO.Builder(x).
        setGuid(true).
        setContextualize(true).
        setAuthorize(false).
        setOf(foam.nanos.demo.relationship.Professor.getOwnClassInfo()).
        setRuler(false).
        build());

      x = x.put("studentDAO", new foam.dao.EasyDAO.Builder(x).
        setContextualize(true).
        setAuthorize(false).
        setSeqNo(true).
        setSeqPropertyName("studentId").
        setOf(foam.nanos.demo.relationship.Student.getOwnClassInfo()).
        setRuler(false).
        build());

      x = x.put("studentCourseJunctionDAO", new foam.dao.EasyDAO.Builder(x).
        setContextualize(true).
        setAuthorize(false).
        setOf(foam.nanos.demo.relationship.StudentCourseJunction.getOwnClassInfo()).
        setRuler(false).
        build());

      foam.dao.DAO studentDAO               = ((foam.dao.DAO)x.get("studentDAO")).inX(x);
      foam.dao.DAO courseDAO                = ((foam.dao.DAO)x.get("courseDAO")).inX(x);
      foam.dao.DAO professorDAO             = ((foam.dao.DAO)x.get("professorDAO")).inX(x);
      foam.dao.DAO studentCourseJunctionDAO = ((foam.dao.DAO)x.get("studentCourseJunctionDAO")).inX(x);

      studentDAO.put(new foam.nanos.demo.relationship.Student.Builder(x).
        setStudentId(1L).
        setName("Adam").
        build());

      studentDAO.put(new foam.nanos.demo.relationship.Student.Builder(x).
        setStudentId(2L).
        setName("Mike").
        build());

      courseDAO.put(new foam.nanos.demo.relationship.Course.Builder(x).
        setCode("CS 101").
        setTitle("Intro to computer science").
        build());

      courseDAO.put(new foam.nanos.demo.relationship.Course.Builder(x).
        setCode("CS 201").
        setTitle("Intro to computer science II").
        build());

      foam.nanos.demo.relationship.Professor donald =
        (foam.nanos.demo.relationship.Professor) professorDAO.put(new foam.nanos.demo.relationship.Professor.Builder(x).
        setName("Donald Knuth").
        build());

      foam.nanos.demo.relationship.Professor alan =
        (foam.nanos.demo.relationship.Professor)professorDAO.put(new foam.nanos.demo.relationship.Professor.Builder(x).
        setName("Alan Kay").
        build());

      foam.nanos.demo.relationship.Student adam = (foam.nanos.demo.relationship.Student)studentDAO.find(1L);
      foam.nanos.demo.relationship.Student mike = (foam.nanos.demo.relationship.Student)studentDAO.find(2L);

      foam.nanos.demo.relationship.Course cs101 = (foam.nanos.demo.relationship.Course)courseDAO.find("CS 101");
      foam.nanos.demo.relationship.Course cs201 = (foam.nanos.demo.relationship.Course)courseDAO.find("CS 201");

      // Assign professors
      // TODO: should we support .add()/.remove() for 1:* relationships as
      // well?
      donald.getCourses(x).put(cs101);
      alan.getCourses(x).put(cs201);

      // Enroll students
      cs101.getStudents(x).add(adam);
      mike.getCourses(x).add(cs201);
      mike.getCourses(x).add(cs101);

      foam.nanos.demo.relationship.Course course = cs101;

      test(course.findProfessor(x).getName() == "Donald Knuth", "Getting Target Object from Source Object (1:*)");

      List<foam.nanos.demo.relationship.Course> donaldsCourses = ((ArraySink) donald.getCourses(x).select(new foam.dao.ArraySink())).getArray();

      test(donaldsCourses.get(0).getCode() == "CS 101", "Getting Source Object from target Object (1:*)");

      List<foam.nanos.demo.relationship.Student> students = ((ArraySink) course.getStudents(x).getDAO().select(new foam.dao.ArraySink())).getArray();

      test(students.size() == 2, "(length check) Getting Source object from target Object (*:*)");

      test(students.get(0).getName() == "Adam", "(Object check) Getting Source object from target Object (*:*)");

      List<foam.nanos.demo.relationship.Course> adamsCourses = ((ArraySink) adam.getCourses(x).getDAO().select(new foam.dao.ArraySink())).getArray();

      test(adamsCourses.size() == 1, "(length check) Getting Target object from Source Object (*:*)");

      test(adamsCourses.get(0).getCode() == "CS 101", "(Object check) Getting Target object from Source Object (*:*)");

      List<foam.nanos.demo.relationship.Course> mikesCourses = ((ArraySink) mike.getCourses(x).getDAO().select(new foam.dao.ArraySink())).getArray();

      test(mikesCourses.size() == 2, "(length check) multiple sources *:*");

      boolean containsCourses = true;

      ArrayList<String> courseCodes = new ArrayList();
      courseCodes.add("CS 101");
      courseCodes.add("CS 201");

      for(foam.nanos.demo.relationship.Course c : mikesCourses) {
        String code = c.getCode();
        containsCourses = containsCourses && courseCodes.contains(code);
      }

      test(containsCourses, "(Object check) multiple sources *:*");

      course = cs201;

      System.out.println("");
      System.out.println("**** " + course.getCode() + " ****");
      System.out.println("Instructor: " + ((foam.nanos.demo.relationship.Professor)((foam.dao.DAO)x.get("professorDAO")).find(course.getProfessor())).getName());
      System.out.println("");
      System.out.println("*** Students ***");
      System.out.println("");

      ArraySink sink = (foam.dao.ArraySink)course.getStudents(x).getDAO().select(null);
      Iterator i = sink.getArray().iterator();

      while ( i.hasNext() ) {
        foam.nanos.demo.relationship.Student student = (foam.nanos.demo.relationship.Student)i.next();
        System.out.println(student.getName());
      }

      foam.nanos.demo.relationship.Professor professor = alan;

      System.out.println("");
      System.out.println("**** " + professor.getName() + " ****");
      System.out.println("*** Courses ***");
      System.out.println("");

      sink = (foam.dao.ArraySink)professor.getCourses(x).select(null);
      i = sink.getArray().iterator();

      while ( i.hasNext() ) {
        course = (foam.nanos.demo.relationship.Course)i.next();
        System.out.println(course.getCode());
      }

      professor = donald;

      System.out.println("");
      System.out.println("**** " + professor.getName() + " ****");
      System.out.println("*** Courses ***");
      System.out.println("");

      sink = (foam.dao.ArraySink)professor.getCourses(x).select(null);
      i = sink.getArray().iterator();

      while ( i.hasNext() ) {
        course = (foam.nanos.demo.relationship.Course)i.next();
        System.out.println(course.getCode());
      }
      `
    }
  ]
});
