//
//  UserService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class UserService: Service {
  public static let instance: UserService = UserService()

  // Helps determine type of error to handle on frontend
  public enum UserError: ServiceErrorProtocol {
    case IncorrectCredentials
    case UpdateFailed
    case UserAlreadyExists
    case UserNotFound
    case UserNotLoggedIn
    case UserUnverifiedEmail
    case UserUnverifiedPhone
    public func description() -> String {
      switch(self) {
        case .IncorrectCredentials:
          return "Incorrect email or password."
        case .UpdateFailed:
          return "Could not update user. Please try again."
        case .UserAlreadyExists:
          return "User already exists. Please try a different email."
        case .UserNotFound:
          return "Could not find user."
        case .UserNotLoggedIn:
          return "Please log in."
        case .UserUnverifiedEmail:
          return "User's email is not verfied."
        case .UserUnverifiedPhone:
          return "User's telephone number has not been verified."
      }
    }
  }

  private var loggedInUser: User?

  init() {
    super.init(withURL: ServiceURL.User)
  }

  /*
   * loggedInUser is private, thus a user cannot modify it unless the user has logged
   * in properly. Therefore, this function should be used to check if there is a valid
   * user logged in
   */
  public func isUserLoggedIn() -> Bool {
    return loggedInUser != nil
  }

  public func getLoggedInUser() -> User? {
    return loggedInUser
  }

  public func isUserVerifiedEmail() -> Bool {
    guard isUserLoggedIn() else { return false; }
    return false; // TEMP as we dont have verified field
  }

  public func isUserVerifiedPhone() -> Bool {
    guard isUserLoggedIn() else { return false; }
    return false; // TEMP as we dont have verified field
  }

  public func isUserFullyVerified() -> (isFullyVerified: Bool, error: Error?) {
    // Ordered from most important to least
    guard isUserLoggedIn()      else { return (false, UserError.UserNotLoggedIn) }
//    NOTE: Commented out until fields are available
//    guard isUserVerifiedEmail() else { return (false, UserError.UserUnverifiedEmail) }
//    guard isUserVerifiedPhone() else { return (false, UserError.UserUnverifiedPhone) }
    return (true, nil)
  }

  public func register(user: User,
                       putDispatchQueue: DispatchQueue = DispatchQueue.global(qos: .background),
                       callbackDispatchQueue: DispatchQueue = DispatchQueue.main,
                       callback: @escaping (Any?) -> Void)
  {
    putDispatchQueue.async {
      do {
        let emailPred = self.X.create(Eq.self, args: [
          "arg1": User.classInfo().axiom(byName: "email"),
          "arg2": user.email,
        ])

        guard let userSink = (try self.dao.`where`(emailPred).skip(0).limit(1).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard userSink.array.count == 0 else {
          DispatchQueue.main.async {
            callback(UserError.UserAlreadyExists)
          }
          return
        }

        guard let newUser = (try self.dao.put(user)) as? User else {
          callbackDispatchQueue.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        callbackDispatchQueue.async {
          callback(newUser)
        }
      } catch let e {
        callbackDispatchQueue.async {
          callback(((e as? FoamError)?.toString()) ?? ServiceError.Failed)
        }
      }
    }
  }

  public func login(withUsername username: String,
                    andPassword pass: String,
                    callback: @escaping (Any?) -> Void)
  {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        // TODO: Get user from DAO and place into self.loggedInUser
        let pred = self.X.create(And.self, args: [
          "args": [
            self.X.create(Eq.self, args: [
              "arg1": User.classInfo().axiom(byName: "email"),
              "arg2": username,
            ]),
            self.X.create(Eq.self, args: [
              "arg1": User.classInfo().axiom(byName: "password"),
              "arg2": pass,
            ])
          ]
        ])

        guard let userSink = (try self.dao.`where`(pred).skip(0).limit(1).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard userSink.array.count > 0 else {
          // User Not Found.
          DispatchQueue.main.async {
            callback(UserError.IncorrectCredentials)
          }
          return
        }

        self.loggedInUser = userSink.array[0] as? User

        let auth = self.isUserFullyVerified()
        guard auth.isFullyVerified else {
          DispatchQueue.main.async {
            callback(auth.error)
          }
          return
        }

        DispatchQueue.main.async {
          callback(self.loggedInUser)
        }
      } catch let e {
        DispatchQueue.main.async {
          callback(((e as? FoamError)?.toString()) ?? ServiceError.Failed)
        }
      }
    }
  }

  // TODO: There is probably a better implementation for this.
  public func reloadUser(callback: @escaping (Any?) -> Void) {
    guard isUserLoggedIn() else { return }
    self.get(userWithId: getLoggedInUser()!.id) {
      response in
      guard let updatedUser = response as? User else {
        guard let error = response as? ServiceErrorProtocol else {
          callback(Service.ServiceError.Failed)
          return
        }
        callback(error)
        return
      }
      self.loggedInUser = updatedUser
      callback(updatedUser)
    }
  }

  public func update(user: User, callback: @escaping (Any?) -> Void) {
    DispatchQueue.global(qos: .userInitiated).async {
      guard self.isUserLoggedIn() else {
        DispatchQueue.main.async {
          callback(UserError.UserNotLoggedIn)
        }
        return
      }
      do {
        guard let updatedUser = (try self.dao.put(user)) as? User else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }
        self.loggedInUser = updatedUser
        DispatchQueue.main.async {
          callback(self.loggedInUser)
        }
      } catch let e {
        DispatchQueue.main.async {
          callback(((e as? FoamError)?.toString()) ?? ServiceError.Failed)
        }
      }
    }
  }

  public func get(userWithId id: Int, callback: @escaping (Any?) -> Void) {
    DispatchQueue.global(qos: .userInitiated).async {
      guard self.isUserLoggedIn() else {
        DispatchQueue.main.async {
          callback(UserError.UserNotLoggedIn)
        }
        return
      }
      do {
        let pred = self.X.create(Eq.self, args: [
          "arg1": User.classInfo().axiom(byName: "id"),
          "arg2": id,
        ])

        guard let userSink = (try self.dao.`where`(pred).skip(0).limit(1).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard userSink.array.count > 0 else {
          // User Not Found.
          DispatchQueue.main.async {
            callback(UserError.UserNotFound)
          }
          return
        }

        guard let user = userSink.array[0] as? User else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        DispatchQueue.main.async {
          callback(user)
        }
      } catch let e {
        DispatchQueue.main.async {
          callback(((e as? FoamError)?.toString()) ?? ServiceError.Failed)
        }
      }
    }
  }

  public func get(userWithEmail email: String, callback: @escaping (Any?) -> Void) {
    DispatchQueue.global(qos: .userInitiated).async {
      guard self.isUserLoggedIn() else {
        DispatchQueue.main.async {
          callback(UserError.UserNotLoggedIn)
        }
        return
      }
      do {
        let pred = self.X.create(Eq.self, args: [
          "arg1": User.classInfo().axiom(byName: "email"),
          "arg2": email,
          ])

        guard let userSink = (try self.dao.`where`(pred).skip(0).limit(1).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard userSink.array.count > 0 else {
          // User Not Found.
          DispatchQueue.main.async {
            callback(UserError.UserNotFound)
          }
          return
        }

        guard let user = userSink.array[0] as? User else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        DispatchQueue.main.async {
          callback(user)
        }
      } catch let e {
        DispatchQueue.main.async {
          callback(((e as? FoamError)?.toString()) ?? ServiceError.Failed)
        }
      }
    }
  }

  public func logout() {
    self.loggedInUser = nil
  }
}
