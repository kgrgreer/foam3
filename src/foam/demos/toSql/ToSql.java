/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.demos.toSql;

import static foam.mlang.MLang.LT;

import java.util.GregorianCalendar;

import foam.core.Detachable;
import foam.core.EmptyX;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.Sink;
import foam.mlang.Constant;
import foam.mlang.Expr;
import foam.mlang.order.Desc;
import foam.mlang.predicate.*;
import foam.mlang.predicate.Eq;
import foam.mlang.predicate.Gt;
import foam.mlang.predicate.Lt;
import foam.mlang.predicate.Or;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Projection;

import static foam.mlang.MLang.*;

/**
 * The main objective of this demo is to familiarize the dev team with the DAO
 * interface.
 */

public class ToSql {

  // SQL version
  // https://www.orafaq.com/wiki/SCOTT
  // http://jailer.sourceforge.net/scott-tiger.sql.html

  @SuppressWarnings("unchecked")
  public static void main(String[] args) {
    java.util.List res;

    DAO deptDao     = new foam.dao.MDAO(foam.demos.toSql.Dept.getOwnClassInfo());
    DAO salGradeDao = new foam.dao.MDAO(foam.demos.toSql.SalGrade.getOwnClassInfo());
    DAO empDao      = new foam.dao.MDAO(foam.demos.toSql.Emp.getOwnClassInfo());

    setup(deptDao, salGradeDao, empDao);

    // select * from emp;
    res = ( (ArraySink) empDao.select(new ArraySink()) ).getArray();
    printList(res);

    // select * from dept;
    res = ( (ArraySink) deptDao.select(new ArraySink()) ).getArray();
    printList(res);

    // select * from emp where sal<1000
    res = ( (ArraySink) empDao.where(LT(foam.demos.toSql.Emp.SAL, 1000.0))
      .select(new ArraySink()) ).getArray();
    printList(res);

    // select ename, job, sal from Emp
    // use alias
    X              x          = EmptyX.instance();
    PropertyInfo[] propNames1 = new PropertyInfo[3];
    propNames1[0] = foam.demos.toSql.Emp.ENAME;
    propNames1[1] = foam.demos.toSql.Emp.JOB;
    propNames1[2] = foam.demos.toSql.Emp.SAL;

    Projection p1 = new Projection.Builder(x).setExprs(propNames1)
      .build();

    empDao.select(p1);

    java.util.List<Object[]> values = p1.getProjection();

    printListArray(values, propNames1);

    // TODO
    // slect ename, sal*12 from Emp
    // print 0 if sal is null
    
    DAO tEmpDao = new MDAO(foam.demos.toSql.Emp.getOwnClassInfo());

    Sink rr = empDao.select(new AbstractSink() {
      public void put(Object obj, Detachable sub) {
        Emp e = (Emp) ( (Emp) obj ).fclone();
        e.setSal(e.getSal()*12);
        tEmpDao.put(e);//not in this DAO
      }
    });
    
    PropertyInfo[] propNames = new PropertyInfo[2];
    propNames[0] = foam.demos.toSql.Emp.ENAME;
    propNames[1] = foam.demos.toSql.Emp.SAL;

    // We can use an array of name property (String) to make the projection.
    // Projection p = ( new
    // foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder() )
    // .buildProjectionForPropertyNamesArray(x,
    // foam.demos.toSql.Emp.getOwnClassInfo(), propNames);

    Projection p = new Projection.Builder(x).setExprs(propNames)
      .build();
    tEmpDao.select(p);
    values = p.getProjection();
    printListArray(values, propNames);

    // select ename from emp where comm is not null
    Expr       e    = new Constant(0);
    Predicate  pred = new Gt(foam.demos.toSql.Emp.COMM, e);
    DAO        r    = empDao.where(pred);
    
    propNames1    = new PropertyInfo[1];
    propNames1[0] = foam.demos.toSql.Emp.ENAME;
    
    Projection p2   = new Projection.Builder(x).setExprs(propNames1)
        .build();
    r.select(p2);
    values = p2.getProjection();
    printListArray(values, propNames1);

    // select ename from emp where comm is null
    
    pred = new Eq(foam.demos.toSql.Emp.COMM, e);
    r    = empDao.where(pred);

    p2 = new Projection.Builder(x).setExprs(propNames1)
      .build();//TODO if I delete the projection, I will get error.
    r.select(p2);
    values = p2.getProjection();
    printListArray(values, propNames1);
    
    // select ename from emp where sal between 800 and 3000  
    Predicate newArgs[] = {
        new Gt(foam.demos.toSql.Emp.COMM, new Constant(800)),
        new Lt(foam.demos.toSql.Emp.COMM, new Constant(3000))};
    pred = new And(newArgs);
    r    = empDao.where(pred);

    p2 = new Projection.Builder(x).setExprs(propNames1)
      .build();//TODO if I delete the projection, I will get error.
    r.select(p2);
    values = p2.getProjection();
    printListArray(values, propNames1);

    // select empno, ename, job, sal from emp where job in ('CLERK','ANALYST')
    //TODO use In operator.
    Predicate jobSelection[] = {
        new Eq(foam.demos.toSql.Emp.JOB, new Constant("CLERK")),
        new Eq(foam.demos.toSql.Emp.JOB, new Constant("ANALYST"))};
    pred = new Or(jobSelection);
    r    = empDao.where(pred);

    propNames1    = new PropertyInfo[3];
    propNames1[0] = foam.demos.toSql.Emp.EMP_NO;
    propNames1[1] = foam.demos.toSql.Emp.ENAME;
    propNames1[2] = foam.demos.toSql.Emp.JOB;
    
    p2 = new Projection.Builder(x).setExprs(propNames1)
      .build();//TODO if I delete the projection, I will get error.
    r.select(p2);
    values = p2.getProjection();
    printListArray(values, propNames1);

    // select ename from emp where ename like 'M%'

    // select ename from emp where ename like '__A%'//3rd position

    // select ename from emp where job = any ('CLERK','ANALYST')

    // select ename from emp where sal! = any (1000,2000,3000,40000)

    // select ename,job , sal from emp order by job, sal desc

    propNames1    = new PropertyInfo[3];
    propNames1[0] = foam.demos.toSql.Emp.ENAME;
    propNames1[1] = foam.demos.toSql.Emp.JOB;
    propNames1[2] = foam.demos.toSql.Emp.SAL;
    
    p2 = new Projection.Builder(x).setExprs(propNames1)
      .build();
    empDao
      .orderBy(DESC(foam.demos.toSql.Emp.JOB))
      .orderBy(DESC(foam.demos.toSql.Emp.SAL))
      .select(p2);

    values = p2.getProjection();
    printListArray(values, propNames1);

    // select distinct job from emp


    // select ename,comm/sal, comm, sal from emp where job='SALESMAN'order by
    // comm/sal;
    
    propNames1    = new PropertyInfo[3];
    propNames1[0] = foam.demos.toSql.Emp.ENAME;
    propNames1[1] = foam.demos.toSql.Emp.JOB;
    propNames1[2] = foam.demos.toSql.Emp.SAL;
    
    p2 = new Projection.Builder(x).setExprs(propNames1)
      .build();
    Sink s;
    empDao
      .orderBy(DESC(foam.demos.toSql.Emp.JOB))
      .orderBy(DESC(foam.demos.toSql.Emp.SAL))
      .select(p2);
  
    values = p2.getProjection();
    printListArray(values, propNames1);
    
    
    System.out.println("*************************************");

    // select ename,sal, comm from emp where comm <sal*0.25

    // select ename,job, decode(comm,null,'sans',0,comm) commission from EMP;

    // select a.ename, b.loc from emp a, emp b where upper(a.ename) = 'SMITH'
    // and a.detno = b.deptno

    // select empno, ename, dname from emp, sept where emp.deptno = dept.deptno

    // select * from emp e, emp f where e.job = f.job and e.hiredate =
    // f.hireDate
    // and f.name = 'ford' and e.name <> 'ford';
    // //or
    // select * from emp where (job, hiredate) in (select job, hiredate from emp
    // where ename = 'ford') and ename <> 'ford')
    // e.job = f.job and e.hiredate = f.hireDate
    // and f.ename = 'ford' and e.ename <> 'ford';

    // select * from emp e, emp kl where e.mgr = kl.mgr and kl.ename = 'CLARK'
    // and e.ename <> 'CLARK'

  }

  private static void printList(java.util.List res) {
    for ( Object object : res ) {
      System.out.println(object.toString());
    }
    System.out.println("\n");
  }

  private static void printListArray(java.util.List<Object[]> values, Object[] stringArr) {
    for ( int i = 0; i < values.size(); i++ ) {
      for ( int j = 0; j < stringArr.length; j++ ) {
        System.out.print(values.get(i)[j] + " ");
      }
      System.out.println("\n");
    }
  }

  private static void setup(DAO deptDao, DAO salGradeDao, DAO empDao) {
    java.util.List res;
    // dept
    Dept d1 = new Dept();
    d1.setId(0);
    d1.setDeptNo(10);
    d1.setDname("Accounting");
    d1.setLoc("new york");

    Dept d2 = new Dept();
    d2.setId(1);
    d2.setDeptNo(20);
    d2.setDname("Research");
    d2.setLoc("dallas");

    Dept d3 = new Dept();
    d3.setId(2);
    d3.setDeptNo(30);
    d3.setDname("Sales");
    d3.setLoc("chicago");

    Dept d4 = new Dept();
    d4.setId(3);
    d4.setDeptNo(40);
    d4.setDname("Operations");
    d4.setLoc("boston");

    deptDao.put(d1);
    deptDao.put(d2);
    deptDao.put(d3);
    deptDao.put(d4);

    res = ( (ArraySink) deptDao.select(new ArraySink()) ).getArray();

    printList(res);

    // grade
    SalGrade s1 = new SalGrade();
    s1.setId(0);
    s1.setGrade(1);
    s1.setLoSal(700);
    s1.setHiSal(1200);

    SalGrade s2 = new SalGrade();
    s2.setId(1);
    s2.setGrade(2);
    s2.setLoSal(1201);
    s2.setHiSal(1400);

    SalGrade s3 = new SalGrade();
    s3.setId(2);
    s3.setGrade(3);
    s3.setLoSal(1401);
    s3.setHiSal(2000);

    SalGrade s4 = new SalGrade();
    s4.setId(3);
    s4.setGrade(4);
    s4.setLoSal(2001);
    s4.setHiSal(3000);

    SalGrade s5 = new SalGrade();
    s5.setId(4);
    s5.setGrade(5);
    s5.setLoSal(3001);
    s5.setHiSal(9999);

    salGradeDao.put(s1);
    salGradeDao.put(s2);
    salGradeDao.put(s3);
    salGradeDao.put(s4);
    salGradeDao.put(s5);

    res = ( (ArraySink) salGradeDao.select(new ArraySink()) ).getArray();

    printList(res);

    // TODO complete the list
    Emp e1 = new Emp();
    e1.setId(0);
    e1.setEmpNo(7369);
    e1.setEname("SMITH");
    e1.setJob("CLERK");
    e1.setHireDate(new GregorianCalendar(1980, 12, 17).getTime());
    e1.setSal(800);
    e1.setComm(0);

    Emp e2 = new Emp();
    e2.setId(1);
    e2.setEmpNo(7499);
    e2.setEname("ALLEN");
    e2.setJob("SALESMAN");
    e2.setHireDate(new GregorianCalendar(1981, 2, 20).getTime());
    e2.setSal(1600);
    e2.setComm(300);

    Emp e3 = new Emp();
    e3.setId(2);
    e3.setEmpNo(7521);
    e3.setEname("WARD");
    e3.setJob("SALESMAN");
    e3.setHireDate(new GregorianCalendar(1981, 2, 22).getTime());
    e3.setSal(1250);
    e3.setComm(500);

    Emp e4 = new Emp();
    e4.setId(3);
    e4.setEmpNo(7566);
    e4.setEname("JONES");
    e4.setJob("MANAGER");
    e4.setHireDate(new GregorianCalendar(1981, 4, 2).getTime());
    e4.setSal(2975);
    e4.setComm(0);

    Emp e5 = new Emp();
    e5.setId(4);
    e5.setEmpNo(7654);
    e5.setEname("MARTIN");
    e5.setJob("SALESMAN");
    e5.setHireDate(new GregorianCalendar(1981, 9, 28).getTime());
    e5.setSal(1250);
    e5.setComm(1400);

    Emp e6 = new Emp();
    e6.setId(5);
    e6.setEmpNo(1000);
    e6.setEname("BLAKE");
    e6.setJob("MANAGER");
    e6.setHireDate(new GregorianCalendar(1981, 5, 1).getTime());
    e6.setSal(2850);
    e6.setComm(0);

    Emp e7 = new Emp();
    e7.setId(6);
    e7.setEmpNo(7782);
    e7.setEname("CLARK");
    e7.setJob("MANAGER");
    e7.setHireDate(new GregorianCalendar(1981, 6, 9).getTime());
    e7.setSal(2450);
    e7.setComm(0);

    Emp e8 = new Emp();
    e8.setId(7);
    e8.setEmpNo(7788);
    e8.setEname("SCOTT");
    e8.setJob("ANALYST");
    e8.setHireDate(new GregorianCalendar(1987, 4, 19).getTime());
    e8.setSal(3000);
    e8.setComm(0);

    Emp e9 = new Emp();
    e9.setId(8);
    e9.setEmpNo(7839);
    e9.setEname("KING");
    e9.setJob("PRESIDENT");
    e9.setHireDate(new GregorianCalendar(1981, 11, 17).getTime());
    e9.setSal(5000);
    e9.setComm(0);

    Emp e10 = new Emp();
    e10.setId(9);
    e10.setEmpNo(7844);
    e10.setEname("TURNER");
    e10.setJob("SALESMAN");
    e10.setHireDate(new GregorianCalendar(1981, 10, 8).getTime());
    e10.setSal(1500);
    e10.setComm(0);

    Emp e11 = new Emp();
    e11.setId(10);
    e11.setEmpNo(7876);
    e11.setEname("ADAMS");
    e11.setJob("CLERK");
    e11.setHireDate(new GregorianCalendar(1987, 5, 23).getTime());
    e11.setSal(1100);
    e11.setComm(0);

    Emp e12 = new Emp();
    e12.setId(11);
    e12.setEmpNo(7900);
    e12.setEname("JAMES");
    e12.setJob("CLERK");
    e12.setHireDate(new GregorianCalendar(1981, 12, 3).getTime());
    e12.setSal(950);
    e12.setComm(0);

    Emp e13 = new Emp();
    e13.setId(12);
    e13.setEmpNo(7902);
    e13.setEname("FORD");
    e13.setJob("ANALYST");
    e13.setHireDate(new GregorianCalendar(1981, 12, 3).getTime());
    e13.setSal(3000);
    e13.setComm(0);

    Emp e14 = new Emp();
    e14.setId(13);
    e14.setEmpNo(7934);
    e14.setEname("MILLER");
    e14.setJob("CLERK");
    e14.setHireDate(new GregorianCalendar(1982, 1, 23).getTime());
    e14.setSal(1300);
    e14.setComm(0);

    e1.setDeptNo(d2.getId());
    e2.setDeptNo(d3.getId());
    e3.setDeptNo(d3.getId());
    e4.setDeptNo(d2.getId());
    e5.setDeptNo(d3.getId());

    e6.setDeptNo(d3.getId());
    e7.setDeptNo(d1.getId());
    e8.setDeptNo(d2.getId());
    e9.setDeptNo(d1.getId());
    e10.setDeptNo(d3.getId());
    e11.setDeptNo(d2.getId());
    e12.setDeptNo(d3.getId());
    e13.setDeptNo(d2.getId());
    e14.setDeptNo(d1.getId());

    e1.setMgr(e13.getId());
    e2.setMgr(e6.getId());
    e3.setMgr(e6.getId());
    e4.setMgr(e9.getId());
    e5.setMgr(e6.getId());
    e6.setMgr(e9.getId());
    e7.setMgr(e9.getId());
    e8.setMgr(e4.getId());
    // e9.setMgr(0);
    e10.setMgr(e6.getId());
    e11.setMgr(e8.getId());
    e12.setMgr(e6.getId());
    e13.setMgr(e4.getId());
    e14.setMgr(e7.getId());

    empDao.put(e1);
    empDao.put(e2);
    empDao.put(e3);
    empDao.put(e4);
    empDao.put(e5);

    empDao.put(e6);
    empDao.put(e7);
    empDao.put(e8);
    empDao.put(e9);
    empDao.put(e10);

    empDao.put(e11);
    empDao.put(e12);
    empDao.put(e13);
    empDao.put(e14);
  }
}
