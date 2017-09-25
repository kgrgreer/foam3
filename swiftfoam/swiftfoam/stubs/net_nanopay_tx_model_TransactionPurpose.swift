// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class TransactionPurpose: AbstractFObject {

  public var proprietary: Bool {
    get {
      
if _proprietary_inited_ {
  return _proprietary_!
}

return false

      
    }
set(value) {
      
self.set(key: "proprietary", value: value)
      
    }
  }

  var _proprietary_: Bool! = nil

  var _proprietary_inited_: Bool = false

  public static let PROPRIETARY: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "proprietary"
  let classInfo: ClassInfo
  let transient = false
  let label = "Proprietary" // TODO localize
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

  private lazy var proprietary_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "proprietary",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var proprietary_Value_Sub_: Subscription?

  public var proprietary$: Slot {
    get {
      return self.proprietary_Value_
    }
set(value) {
      
self.proprietary_Value_Sub_?.detach()
self.proprietary_Value_Sub_ = self.proprietary$.linkFrom(value)
self.onDetach(self.proprietary_Value_Sub_!)
      
    }
  }

  public var code: String {
    get {
      
if _code_inited_ {
  return _code_!
}

return ""

      
    }
set(value) {
      
self.set(key: "code", value: value)
      
    }
  }

  var _code_: String! = nil

  var _code_inited_: Bool = false

  public static let CODE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "code"
  let classInfo: ClassInfo
  let transient = false
  let label = "Code" // TODO localize
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

  private lazy var code_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "code",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var code_Value_Sub_: Subscription?

  public var code$: Slot {
    get {
      return self.code_Value_
    }
set(value) {
      
self.code_Value_Sub_?.detach()
self.code_Value_Sub_ = self.code$.linkFrom(value)
self.onDetach(self.code_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_proprietary_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Bool {
    return newValue as! Bool
  }

  private func `_proprietary_preSet_`(_ oldValue: Any?, _ newValue: Bool) -> Bool {
    return newValue
  }

  private func `_proprietary_postSet_`(_ oldValue: Any?, _ newValue: Bool) {
    
  }

  private func `_code_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_code_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_code_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return TransactionPurpose.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return TransactionPurpose.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "proprietary":
    _proprietary_inited_ = false
    _proprietary_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "proprietary"]) {
      _ = pub(["propertyChange", "proprietary", proprietary$])
    }
    break

  case "code":
    _code_inited_ = false
    _code_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "code"]) {
      _ = pub(["propertyChange", "code", code$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "proprietary": return `_proprietary_inited_`

  case "code": return `_code_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "proprietary": return `proprietary`

  case "code": return `code`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "proprietary": return `proprietary$`

  case "code": return `code$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "proprietary$":
    proprietary$ = value as! Slot
    return
  case "proprietary":
  
    let oldValue: Any? = _proprietary_inited_ ? self.`proprietary` : nil
    _proprietary_ = _proprietary_preSet_(oldValue, _proprietary_adapt_(oldValue, value))
    _proprietary_inited_ = true
    _proprietary_postSet_(oldValue, _proprietary_)
    if hasListeners(["propertyChange", "proprietary"]) && !FOAM_utils.equals(oldValue, _proprietary_) {
      _ = pub(["propertyChange", "proprietary", proprietary$])
    }
    return

  case "code$":
    code$ = value as! Slot
    return
  case "code":
  
    let oldValue: Any? = _code_inited_ ? self.`code` : nil
    _code_ = _code_preSet_(oldValue, _code_adapt_(oldValue, value))
    _code_inited_ = true
    _code_postSet_(oldValue, _code_)
    if hasListeners(["propertyChange", "code"]) && !FOAM_utils.equals(oldValue, _code_) {
      _ = pub(["propertyChange", "code", code$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "net.nanopay.tx.model.TransactionPurpose"

    lazy var label: String = "Transaction Purpose"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [PROPRIETARY,CODE]

    lazy var cls: AnyClass = TransactionPurpose.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return TransactionPurpose(args, x)
    }

  }

}