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

    let userSink = (try? userDAO.skip(0).limit(2).select(ArraySink())) as? ArraySink
    let user = userSink?.array[0] as? User
    XCTAssertNotNil(user)

//    let accountSink = (try? accountDAO.skip(0).limit(100).select(ArraySink())) as? ArraySink
//    let account = accountSink?.array[0] as? Account
//    XCTAssertNotNil(account)
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

    TransactionService.instance.transferValueBy(transaction: t) {
      response in
      guard let t2 = response as? Transaction else {
        return
      }
      XCTAssertNotNil(t2)
      XCTAssertEqual(t2.payerId, 1)
      XCTAssertEqual(t2.payeeId, 2)
      XCTAssertEqual(t2.amount, 1)
      XCTAssertEqual(t2.rate, 15)
      XCTAssertEqual(t2.fees, 20)
      XCTAssertEqual(t2.notes, "Mike's test!")

      XCTAssertNotEqual(t.compareTo(t2), 0)
      t.id = t2.id
      t.date = t2.date
      XCTAssertEqual(t.compareTo(t2), 0)
    }
  }

  func testGetTransactions() {
    let expectations:[XCTestExpectation] = [XCTestExpectation(description: "Get TX Expectation")]
    TransactionService.instance.getTransactions(startingAt: 0) {
      response in
      XCTAssertNotNil(response)
      guard let transactions = response as? [Transaction] else {
        XCTFail()
        return
      }
      XCTAssertEqual(transactions.count, 100)
      expectations.first!.fulfill()
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
      expectations.append(XCTestExpectation(description: "ThreadSafe Expectation \(i)"))
      TransactionService.instance.transferValueBy(transaction: t) {
        response in
        guard let _ = response as? Transaction else {
          errors.append("invalid response in async task \(i)")
          expectations[i].fulfill()
          return
        }
        print("Fulfilling Expectation \(i)")
        expectations[i].fulfill()
      }
    }

    wait(for: expectations, timeout: 20)
    XCTAssertEqual(errors.count, 0)
  }
}
