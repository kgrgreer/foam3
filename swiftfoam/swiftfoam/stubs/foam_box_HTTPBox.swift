// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class HTTPBox: AbstractFObject, Box {

  public var creationContext: Any? {
    get {
      
return __context__["creationContext"]
      
    }
set(value) {
      
self.creationContext$?.swiftSet(value)
      
    }
  }

  public var creationContext$: Slot? {
    get {
      
return __context__["creationContext$"] as? Slot ?? nil
      
    }
  }

  public var me: Any? {
    get {
      
return __context__["me"]
      
    }
set(value) {
      
self.me$?.swiftSet(value)
      
    }
  }

  public var me$: Slot? {
    get {
      
return __context__["me$"] as? Slot ?? nil
      
    }
  }

  public var window: Any? {
    get {
      
return __context__["window"]
      
    }
set(value) {
      
self.window$?.swiftSet(value)
      
    }
  }

  public var window$: Slot? {
    get {
      
return __context__["window$"] as? Slot ?? nil
      
    }
  }

  public var url: String {
    get {
      
if _url_inited_ {
  return _url_!
}

return ""

      
    }
set(value) {
      
self.set(key: "url", value: value)
      
    }
  }

  var _url_: String! = nil

  var _url_inited_: Bool = false

  public static let URL: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "url"
  let classInfo: ClassInfo
  let transient = false
  let label = "Url" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var url_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "url",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var url_Value_Sub_: Subscription?

  public var url$: Slot {
    get {
      return self.url_Value_
    }
set(value) {
      
self.url_Value_Sub_?.detach()
self.url_Value_Sub_ = self.url$.linkFrom(value)
self.onDetach(self.url_Value_Sub_!)
      
    }
  }

  public var method: String {
    get {
      
if _method_inited_ {
  return _method_!
}

return "POST"

      
    }
set(value) {
      
self.set(key: "method", value: value)
      
    }
  }

  var _method_: String! = nil

  var _method_inited_: Bool = false

  public static let METHOD: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "method"
  let classInfo: ClassInfo
  let transient = false
  let label = "Method" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var method_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "method",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var method_Value_Sub_: Subscription?

  public var method$: Slot {
    get {
      return self.method_Value_
    }
set(value) {
      
self.method_Value_Sub_?.detach()
self.method_Value_Sub_ = self.method$.linkFrom(value)
self.onDetach(self.method_Value_Sub_!)
      
    }
  }

  public var parser: FObjectParser {
    get {
      
if _parser_inited_ {
  return _parser_!
}

self.set(key: "parser", value: _parser_factory_())
return _parser_!

      
    }
set(value) {
      
self.set(key: "parser", value: value)
      
    }
  }

  var _parser_: FObjectParser! = nil

  var _parser_inited_: Bool = false

  public static let PARSER: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "parser"
  let classInfo: ClassInfo
  let transient = false
  let label = "Parser" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var parser_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "parser",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var parser_Value_Sub_: Subscription?

  public var parser$: Slot {
    get {
      return self.parser_Value_
    }
set(value) {
      
self.parser_Value_Sub_?.detach()
self.parser_Value_Sub_ = self.parser$.linkFrom(value)
self.onDetach(self.parser_Value_Sub_!)
      
    }
  }

  public var outputter: Outputter? {
    get {
      
if _outputter_inited_ {
  return _outputter_
}

self.set(key: "outputter", value: _outputter_factory_())
return _outputter_!

      
    }
set(value) {
      
self.set(key: "outputter", value: value)
      
    }
  }

  var _outputter_: Outputter? = nil

  var _outputter_inited_: Bool = false

  public static let OUTPUTTER: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "outputter"
  let classInfo: ClassInfo
  let transient = false
  let label = "Outputter" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var outputter_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "outputter",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var outputter_Value_Sub_: Subscription?

  public var outputter$: Slot {
    get {
      return self.outputter_Value_
    }
set(value) {
      
self.outputter_Value_Sub_?.detach()
self.outputter_Value_Sub_ = self.outputter$.linkFrom(value)
self.onDetach(self.outputter_Value_Sub_!)
      
    }
  }

  lazy var send$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let msg = args[0] as! Message

    
    return try self!.`send`(
        _: msg)
  }
])
      
  }()

  public static let SEND: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "send"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `Outputter_create`(_ args: [String:Any?] = [:]) -> HTTPBoxOutputter {
    
return __subContext__.create(HTTPBoxOutputter.self, args: args)!
      
  }

  public func `Parser_create`(_ args: [String:Any?] = [:]) -> FObjectParser {
    
return __subContext__.create(FObjectParser.self, args: args)!
      
  }

  private func `_url_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_url_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_url_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_method_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_method_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_method_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_parser_factory_`() -> FObjectParser {
    return Parser_create()
  }

  private func `_parser_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> FObjectParser {
    return newValue as! FObjectParser
  }

  private func `_parser_preSet_`(_ oldValue: Any?, _ newValue: FObjectParser) -> FObjectParser {
    return newValue
  }

  private func `_parser_postSet_`(_ oldValue: Any?, _ newValue: FObjectParser) {
    
  }

  private func `_outputter_factory_`() -> Outputter? {
    return Outputter_create()
  }

  private func `_outputter_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Outputter? {
    return newValue as! Outputter?
  }

  private func `_outputter_preSet_`(_ oldValue: Any?, _ newValue: Outputter?) -> Outputter? {
    return newValue
  }

  private func `_outputter_postSet_`(_ oldValue: Any?, _ newValue: Outputter?) {
    
  }

  public func `send`(_ msg: Message) throws {
    
var request = URLRequest(url: Foundation.URL(string: self.url)!)
request.httpMethod = "POST"
request.httpBody = outputter?.swiftStringify(msg).data(using: .utf8)
let task = URLSession.shared.dataTask(with: request) { data, response, error in
  guard let data = data else {
    fatalError()
  }
  if let me = self.me as? Box,
     let str = String(data: data, encoding: .utf8),
     let obj = self.parser.parseString(str) as? Message {
    try? me.send(obj)
  }
}
task.resume()
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return HTTPBox.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return HTTPBox.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "url":
    _url_inited_ = false
    _url_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "url"]) {
      _ = pub(["propertyChange", "url", url$])
    }
    break

  case "method":
    _method_inited_ = false
    _method_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "method"]) {
      _ = pub(["propertyChange", "method", method$])
    }
    break

  case "parser":
    _parser_inited_ = false
    _parser_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "parser"]) {
      _ = pub(["propertyChange", "parser", parser$])
    }
    break

  case "outputter":
    _outputter_inited_ = false
    _outputter_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "outputter"]) {
      _ = pub(["propertyChange", "outputter", outputter$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "url": return `_url_inited_`

  case "method": return `_method_inited_`

  case "parser": return `_parser_inited_`

  case "outputter": return `_outputter_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "url": return `url`

  case "method": return `method`

  case "parser": return `parser`

  case "outputter": return `outputter`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "url": return `url$`

  case "method": return `method$`

  case "parser": return `parser$`

  case "outputter": return `outputter$`


  case "send": return `send$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "url$":
    url$ = value as! Slot
    return
  case "url":
  
    let oldValue: Any? = _url_inited_ ? self.`url` : nil
    _url_ = _url_preSet_(oldValue, _url_adapt_(oldValue, value))
    _url_inited_ = true
    _url_postSet_(oldValue, _url_)
    if hasListeners(["propertyChange", "url"]) && !FOAM_utils.equals(oldValue, _url_) {
      _ = pub(["propertyChange", "url", url$])
    }
    return

  case "method$":
    method$ = value as! Slot
    return
  case "method":
  
    let oldValue: Any? = _method_inited_ ? self.`method` : nil
    _method_ = _method_preSet_(oldValue, _method_adapt_(oldValue, value))
    _method_inited_ = true
    _method_postSet_(oldValue, _method_)
    if hasListeners(["propertyChange", "method"]) && !FOAM_utils.equals(oldValue, _method_) {
      _ = pub(["propertyChange", "method", method$])
    }
    return

  case "parser$":
    parser$ = value as! Slot
    return
  case "parser":
  
    let oldValue: Any? = _parser_inited_ ? self.`parser` : nil
    _parser_ = _parser_preSet_(oldValue, _parser_adapt_(oldValue, value))
    _parser_inited_ = true
    _parser_postSet_(oldValue, _parser_)
    if hasListeners(["propertyChange", "parser"]) && !FOAM_utils.equals(oldValue, _parser_) {
      _ = pub(["propertyChange", "parser", parser$])
    }
    return

  case "outputter$":
    outputter$ = value as! Slot
    return
  case "outputter":
  
    let oldValue: Any? = _outputter_inited_ ? self.`outputter` : nil
    _outputter_ = _outputter_preSet_(oldValue, _outputter_adapt_(oldValue, value))
    _outputter_inited_ = true
    _outputter_postSet_(oldValue, _outputter_)
    if hasListeners(["propertyChange", "outputter"]) && !FOAM_utils.equals(oldValue, _outputter_) {
      _ = pub(["propertyChange", "outputter", outputter$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.HTTPBox"

    lazy var label: String = "HTTPBox"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [URL,METHOD,PARSER,OUTPUTTER,SEND]

    lazy var cls: AnyClass = HTTPBox.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return HTTPBox(args, x)
    }

  }

}