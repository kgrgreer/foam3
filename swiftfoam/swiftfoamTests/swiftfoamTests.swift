import XCTest
@testable import swiftfoam

class swiftfoamTests: XCTestCase {
  override func setUp() {
    super.setUp()
    FOAM_utils.registerClasses()
  }

  override func tearDown() {
    super.tearDown()
  }

  func testTransactionDAO() {
    let boxContext = BoxContext()
    let X = boxContext.__subContext__

    let httpBox = X.create(HTTPBox.self)!
    httpBox.url = "http://localhost:8080/transactionDAO"

    let dao = X.create(BaseClientDAO.self)!
    dao.delegate = httpBox

    let sink = dao.skip(0).limit(1).select(ArraySink()) as? ArraySink
    let transaction = sink?.array[0] as? Transaction
    XCTAssertNotNil(transaction)
  }
}
