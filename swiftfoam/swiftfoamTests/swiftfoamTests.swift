import XCTest
@testable import swiftfoam

class swiftfoamTests: XCTestCase {
  override func setUp() {
    super.setUp()
  }

  override func tearDown() {
    super.tearDown()
  }

  func testSelectTransactionDAO() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let httpBox = X.create(HTTPBox.self)!
    httpBox.url = ServiceURL.Transaction.path()

    let dao = X.create(ClientDAO.self)!
    dao.delegate = httpBox

    let sink = (try? dao.skip(0).limit(1).select(ArraySink())) as? ArraySink
    let transaction = sink?.array[0] as? Transaction
    XCTAssertNotNil(transaction)
  }

  func testSelectUserDAO() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let userDAOBox = X.create(HTTPBox.self)!
    userDAOBox.url = ServiceURL.User.path()
    let userDAO = X.create(ClientDAO.self)!
    userDAO.delegate = userDAOBox

    let accountDAOBox = X.create(HTTPBox.self)!
    accountDAOBox.url = ServiceURL.Account.path()
    let accountDAO = X.create(ClientDAO.self)!
    accountDAO.delegate = accountDAOBox

    let userSink = (try? userDAO.skip(0).limit(100).select(ArraySink())) as? ArraySink
    let user = userSink?.array[0] as? User
    XCTAssertNotNil(user)

//    let accountSink = (try? accountDAO.skip(0).limit(100).select(ArraySink())) as? ArraySink
//    let account = accountSink?.array[0] as? Account
//    XCTAssertNotNil(account)
  }

  func testWhereUserDAO() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let userDAOBox = X.create(HTTPBox.self)!
    userDAOBox.url = "http://localhost:8080/userDAO"
    let userDAO = X.create(ClientDAO.self)!
    userDAO.delegate = userDAOBox

    let pred = X.create(And.self, args: [
      "args": [
        X.create(Eq.self, args: [
          "arg1": User.classInfo().axiom(byName: "email"),
          "arg2": "simon@gmail.com",
        ]),
        X.create(Eq.self, args: [
          "arg1": User.classInfo().axiom(byName: "password"),
          "arg2": "22b70d9b9c98bdfee23e47c874f4a92257268449572e7edfcaa7f0eee569b7de35e8bea44e5b93e3e1dce9cf96425ac3c7fc88b6cfa53a6fa9064b99244192ce:5932aeb0bda8cf763dc94f02459799250a619b6d",
        ])
      ]
    ])

    let userSink = (try? userDAO.`where`(pred).skip(0).limit(100).select(ArraySink())) as? ArraySink
    XCTAssertEqual(userSink?.array.count, 1)
  }

  func testLogin() {
    var expectations:[XCTestExpectation] = []
    let expLoginSuccess = XCTestExpectation(description: "Login Expection - Login Successful")
    let expLoginFailure = XCTestExpectation(description: "Login Expection - Login Failure")
    expectations.append(expLoginSuccess)
    expectations.append(expLoginFailure)
//    NOTE: Need to wait for actual fields inside auth object
//    expectations.append(XCTestExpectation(description: "Login Expection - Email Unverified"))
//    expectations.append(XCTestExpectation(description: "Login Expection - Phone Unverified"))
    UserService.instance.login(withUsername: "simon@gmail.com", andPassword: "22b70d9b9c98bdfee23e47c874f4a92257268449572e7edfcaa7f0eee569b7de35e8bea44e5b93e3e1dce9cf96425ac3c7fc88b6cfa53a6fa9064b99244192ce:5932aeb0bda8cf763dc94f02459799250a619b6d") {
      response in
      XCTAssertNotNil(UserService.instance.getLoggedInUser())
      guard let _ = response as? User else {
        XCTFail()
        expLoginSuccess.fulfill()
        return
      }
      expLoginSuccess.fulfill()
    }

    UserService.instance.login(withUsername: "simon@gmail.com", andPassword: "IShouldFailDueToIncorrectCredentials") {
      response in
      guard let error = response as? UserService.UserError else {
        XCTFail()
        expLoginFailure.fulfill()
        return
      }
      XCTAssert(error == .IncorrectCredentials)
      expLoginFailure.fulfill()
    }

    wait(for: expectations, timeout: 20)
  }

  func testPutTransactionDAO() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let t = X.create(Transaction.self)!
    t.payerId = 1
    t.payeeId = 2
    t.amount = 1
    t.rate = 15
    t.fees = 20
    t.notes = "Mike's test!"

    let expectations:[XCTestExpectation] = [XCTestExpectation(description: "Put TX Expectation")]
    TransactionService.instance.transferValueBy(transaction: t) {
      response in
      guard let t2 = response as? Transaction else {
        XCTFail()
        return
      }
      XCTAssertNotNil(t2)
      XCTAssertEqual(t2.payerId, 1)
      XCTAssertEqual(t2.payeeId, 2)
      XCTAssertEqual(t2.amount, 1)
      XCTAssertEqual(t2.rate, 15)
      XCTAssertEqual(t2.fees, 20)
      XCTAssertEqual(t2.notes, "Mike's test!")

      expectations[0].fulfill()
    }
    wait(for: expectations, timeout: 20)
  }

  func testGetTransactions() {
    var expectations:[XCTestExpectation] = [XCTestExpectation(description: "Get TX Failure Expectation")]
    TransactionService.instance.getTransactions(startingAt: 0) {
      response in
      XCTAssertNotNil(response)
      let error = response as! UserService.UserError
      XCTAssert(error == .UserNotLoggedIn)
      expectations[0].fulfill()
    }
    wait(for: expectations, timeout: 20)

    expectations.append(XCTestExpectation(description: "Login Expectation"))
    UserService.instance.login(withUsername: "simon@gmail.com", andPassword: "22b70d9b9c98bdfee23e47c874f4a92257268449572e7edfcaa7f0eee569b7de35e8bea44e5b93e3e1dce9cf96425ac3c7fc88b6cfa53a6fa9064b99244192ce:5932aeb0bda8cf763dc94f02459799250a619b6d") {
      response in
      XCTAssertNotNil(UserService.instance.getLoggedInUser())
      guard let _ = response as? User else {
        XCTFail()
        expectations[1].fulfill()
        return
      }
      expectations[1].fulfill()
    }
    wait(for: expectations, timeout: 20)

    expectations.append(XCTestExpectation(description: "Get TX Success Expectation"))
    TransactionService.instance.getTransactions(startingAt: 0) {
      response in
      XCTAssertNotNil(response)
      guard let transactions = response as? [Transaction] else {
        XCTFail()
        expectations[2].fulfill()
        return
      }
      for tx in transactions {
        XCTAssert(tx.payerId == UserService.instance.getLoggedInUser()?.id || tx.payeeId == UserService.instance.getLoggedInUser()?.id)
      }
      expectations[2].fulfill()
    }
    wait(for: expectations, timeout: 20)

    expectations.append(XCTestExpectation(description: "Get TX Failed Expectation"))
    TransactionService.instance.getTransactionBy(transactionId: 1276854863548) {
      response in
      XCTAssertNotNil(response)
      guard let error = response as? TransactionService.TransactionError else {
        XCTFail()
        expectations[3].fulfill()
        return
      }
      XCTAssert(error == .TransactionNotFound)
      expectations[3].fulfill()
    }
    wait(for: expectations, timeout: 20)
  }

  func testThreadSafe() {
    let X = Context.GLOBAL

    let t = X.create(Transaction.self)!
    t.payerId = 1
    t.payeeId = 2
    t.amount = 1 //cents
    t.rate = 15
    t.fees = 20
    t.notes = "Mike's test!"

    var errors:[String] = []
    var expectations:[XCTestExpectation] = []
    for i in 0 ..< 50 {
      // put expectations into array first before attempting to fulfil them
      expectations.append(XCTestExpectation(description: "ThreadSafe Expectation \(i)"))
    }

    for i in 0 ..< 50 {
      TransactionService.instance.transferValueBy(transaction: t) {
        response in
        guard let _ = response as? Transaction else {
          errors.append("invalid response in async task \(i)")
          expectations[i].fulfill()
          return
        }
        expectations[i].fulfill()
      }
    }

    wait(for: expectations, timeout: 20)
    XCTAssertEqual(errors.count, 0)
  }
}
