<!-- .slide: data-background="#003d73" -->
# Type / Model based programing

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

## Agenda

* Types
  * Union
  * Sum
  * Enumerations
* Modeling
* Examples

---

## Types

> Data dominates. If you've chosen the right data structures and organized things well, the algorithms will almost always be self-evident. Data structures, not algorithms, are central to programming.
> - Rob Pike in 1989

Note: TODO: something about types?

----

### Abbrev 

* Type alias

```fsharp
type ProductName = string
type parseProductName = ProductName -> Option<ProductName>
```

----

### Product type

* Tuples

```fsharp
type Birthday = Person * Date
```

----

### Records

```fsharp
type StructPoint = 
    { X: float
      Y: float
      Z: float }
```

----

### Sum

* Discriminated Unions
* uses of `of`

```fsharp
type Meassurement = Cm | Meter | Kilometer
type IntOrBool =
  | I of Int
  | B of Bool
```

----

### Options

```fsharp
type Option<'a> =
   | Some of 'a
   | None
```

----

### Enumeration

* Simular to sum type
  * Uses `Equal` and `int` value

```fsharp
type Meassurement = CM = | Meter = 1 | Kilometer = 2
```

---

## Examples Quadratic equations

 ![Quardraitic equations](./img/quadratic_formula.gif "Quadratic equations")

----

### Domain 

``` fsharp [1|2|4]
type Equation = float * float * float
type Solution = float * float

type solve = Equation -> Solution
```

Solution:

`$$ x = \frac {-b \pm \sqrt {b^2 - 4ac}}{2a}$$`

----

### Solution

```fsharp [7|2,6|4]
let solve a b c =
  let d = b*b - 4.0*a*c
  if d < 0.0 || a = 0.0
  then failWith "discrimant is negative or a is zero"
  else 
    let sqrtD = sqrt d
    ((-b + sqrtD) / (2.0*a), (-b - sqrtD) / (2.0*a))
```

_Left as a exercise to try and capture the possible solutions (2 roots, 1 root, 0 roots)_

---

## Modelling

```fsharp
type Contact = {
  FirstName: string
  MiddleName: string
  LastName: string

  EmailAddress: string
  IsEmailVerified: bool
}
```

How can we do better?

----

### Optional

* Use types to express business constraints

```fsharp [3]
type Contact = {
  FirstName: string
  MiddleName: string option
  LastName: string

  EmailAddress: string
  IsEmailVerified: bool
}
```

----

#### Single choice types

* Two strings are not interchangeable
* Create Email in on places

```fsharp [1-4|8-12]
type Email = | Email of string

module Email =
  let createEmail (s: String): Option<Email>
     = failWith "implement"

type NameInfo = {
  FirstName: String50
  MiddleName: string50 option
  LastName: string50

  Email: Email
  IsEmailVerified: bool
}
```

----

### Linked fields

* Easier to reuse 

```fsharp [1-5|6-9|11-14]
type NameInfo = {
  FirstName: String50
  MiddleName: string50 option
  LastName: string50
}
type EmailInfo {
  EmailAddress: Email
  IsEmailVerified: bool
}

type Contact = {
  name: NameInfo
  email: EmailInfo
}
```

----

### Constraint

- Business logic in types

```fsharp
type EmailInfo {
  EmailAddress: Email
  IsEmailVerified: bool
}
```

- Here we want `IsEmailVerified` to change to false, whenever a new email is used
- Not all should be able to set `IsEmailVerified`

----

### Constraint 2

```fsharp
type VerifiedEmail = VerifiedEmail of Email

type VerifyEmailSerice =
  (Email * Hash) -> VerifiedEmail option

type EmailInfo =
  | Verified of VerifiedEmail
  | UnVerifiedEmail of Email

```

----

### Documentation

* ![""](./img/self_documenting.jpeg "") <!-- .element style="height:50vh; background-color:white; float:right;" -->
* All code on the previeus slides are compilable code
* Can argue that most can be read by non-F# programmers
* Document constraints and logic
* Develops a language we can use to talk about the code

----

### Avoid errors

* New requirements: Email or Postal address

```fsharp [3-4]
type Contact = {
  name: NameInfo
  email: EmailInfo opton
  postal: PostalInfo option
}
```

- Lets make sure we cannot represent and error state

----

### Make illegal states unrepresentable

```fsharp [2-3|4|8]
type Contactinfo =
  | OnlyEmail of EmailInfo
  | OnlyPostal of PostalInfo
  | BothEmailAndPostal of EmailInfo * PostalInfo

type Contact = {
  name: NameInfo
  contact: ContactInfo
}
```

What about if there should be a secondary contact address?

----

### Domain Driven Design


* "The model and the heart of the design shape each other."
* "The model is the backbone of the language used by all team members."
* "The model is distilled knowledge."

![Ubiquitous Language](./img/ubiquitous_language.png "Ubiquitous Language") <!-- .element style="height: 200px;" -->

---

## Examples Cash register

![Cash register](./img/cash_register.jpg "Cash register")

----

### Domain

```fsharp [1-6|8-11 ]
// Register
type Code = string
type Name = string
type Price = int

type Register = (Code * (Name*Price)) list

// Purchase
type NoPiece = int
type Item = NoPiece * Code
type Purchase = Item list
```

----

### Domain (cont.)

```fsharp [1-4|6-8]
// Bill
type Info = NoPiece * Name * Price
type InfoList = Info list
type Bill = Info list * Price

// Functions
type findArticle = Code -> Register -> (Name*Price)
type makeBill = Register -> Purchase-> Bill
```

Note: The more general type actually given by F#

---

## Examples Map Coloring

![Map Coloring](./img/map_coloring.png "Map Coloring")

----

### Domain

```fsharp [1-5|7-8]
type Country = string
type Map = (Country * Country) list

type Color = Country list
type Coloring = Color list

// Goal
type colorMap = Map -> Coloring
```

----

### Functions

```fsharp
let areNeighbours = Country -> Country -> bool
let canBeExtendedBy = Map -> Color -> Country -> bool
let extendColoring = Map -> Coloring -> Country -> Coloring
let countries = Map -> Country list
let colorContries = Map -> Country list -> Coloring
```


Note: Break down of the functions from colorMap
TODO: Add notes for students

---

## Examples State machine

![State machine](./img/state.png "State machine")

----

### Domain

```fsharp
// Auxiliary types
type MessageHandler = unit -> Timed<unit>;;

// State data
type ReadyData = Timed<TimeSpan list>;;
type ReceivedMessageData =
        Timed<TimeSpan list * MessageHandler>;;
type NoMessageData = Timed<TimeSpan list>;;
```

Note: Message handler keeps that state clean of the concrete data

End state don't need any data in this example


----

### States

Representing states of the STM

```fsharp
type PollingConsumer =
  | ReadyState of ReadyData
  | ReceivedMessageState of ReceivedMessageData
  | NoMessageState of NoMessageData
  | StoppedState;;
```

----

### Transitions

Aiming for a transition function from each state

```fsharp
type transitionFromStopped =
      unit -> PollingConsumer;;
type transitionFromNoMessage =
      NoMessageData -> PollingConsumer;;
type transitionFromReceived =
      ReceivedMessageData -> PollingConsumer;;
type transitionFromReady =
      ReadyData -> PollingConsumer;;
```

----

### Implementation

Starting with transitionFromNoMessage

```fsharp
let transitionFromNoMessage (nm : NoMessageData) =
    if shouldIdle nm
    then idle () |> ReadyState
    else StoppedState
```

----

### STM

![State machine](./img/state.png "State machine")

----

```fsharp
let transitionFromNoMessage (nm : NoMessageData) =
    if shouldIdle nm
    then idle () |> ReadyState
    else StoppedState
```

Since this does not compiles - refactoring into

```fsharp
let transitionFromNoMessage shouldIdle idle
                         (nm : NoMessageData) =
    if shouldIdle nm
    then idle () |> ReadyState
    else StoppedState
// val transitionFromNoMessage :
//   shouldIdle:(NoMessageData -> bool) ->
//     idle:(unit -> ReadyData) -> nm:NoMessageData
//       -> PollingConsumer
```

----

### Still not done

*   Model the domain directly in code
* Type system helps with refactoring
* Keeps a todo list

---

# References

Inspirations from: 

https://fsharpforfunandprofit.com/ddd/

https://blog.ploeh.dk/2015/08/10/type-driven-development/

Images from:

http://geek-and-poke.com/geekandpoke/2013/2/14/self-documenting-code.html
