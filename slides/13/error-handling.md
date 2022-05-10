<!-- .slide: data-background="#003d73" -->
## Functional error handling 

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

### Agenda

* Problem
* Result / Either monad
* Composition
* Convertion
* Exceptions && Parallel validation

---

### Problem

* A 'normal' program consists of
  1. Validation
  2. Reading data from db/api
  3. Complete functions in buisiness logic
  4. Updatting data in db
  5. Accessing network
  6. Showing results

----

#### No thinking about errors

```fsharp
let useCase (json:string) =
  let person = validatePerson json
  let ssn = db.readSSN person
  let bornIn = api.findMunicipality ssn
  let newData = createNewPerson bornIn
  db.updateMunicipality newData
```

Note:

```fsharp
type person = {ssn: string; bornIn: string option}
let validatePerson (json: string) =
  {ssn = "1234"; bornIn = None}

let createNewPerson bornIn =
  {ssn = "1234"; bornIn = Some bornIn}

module db =
  let readSSN person = person.ssn
  let updateMunicipality person = "Success"

module api =
  let findMunicipality ssn =
    "Aarhus"
```

----

#### More F#'ish

```fsharp
let useCase =
  validatePerson 
  >> db.readSSN
  >> api.findMunicipality
  >> createNewPerson 
  >> db.updateMunicipality
```

----

<!-- .slide: data-background-image="./img/error.jpg" -->


----

#### But what about the actual errors

![Error paths](./img/Recipe_ErrorPath.png)

----

#### Errors

* Some of these functions can fail in different ways
  * IOError
  * DBError
  * Verification error
  * Authentication error

How do we compose code that can result in errors with our FP functions?

----

#### Solution

We need a way to compose functions into a single use-case function like:

![Use case](./img/Recipe_Function_Union4.png)

----

#### Changing our code to handle errors

```fsharp
let useCase (json:string) =
  let person = validatePerson json
  if person != null then
    let ssn = db.readSSN person
    if (ssn != null) then
      let bornIn = api.findMunicipality ssn
      if string.IsNullOrEmpty bornIn then
        let newData = createNewPerson bornIn
        db.updateMunicipality newData
      else "Municipality not found"
    else "Person not found"
  else
    "Validation error"
```



----

#### Less OOP like

```fsharp
let useCase json: Return =
  let person = validatePerson json
  match person with
  | Some p -> 
    let ssnOpt = db.readSSN person
    match ssnOpt with
    | Some ssn ->
      let bornIn = api.findMunicipality ssn
      match bordnInOpt with
      | Some bornIn ->
        let newData = createNewPerson person bornIn
        let result = db.updateMunicipality newData
        "Sucess"
      | None -> "Municipality not found"
    | None -> "Person not found"
  | None -> "Validation error"
```

Note: Could have choosen to return `Result` from our functions instead of Options - same problem

----

#### Return Types

```fsharp
type Return =
  | Success
  | DBError
  | IOError
  | VerificationError
  /// ...
```

----

#### Analysis of solution

Drawbacks:
* Hard to match on
* Will consist of all error types in our application
* or many `Return` types, we need to navigate in. 


---

#### Simplification

```fsharp
type NoValueResult = Success | Error
// or
type Result<'TError, 'TSuccess> =
  | Success of 'TSuccess
  | Error of 'TError
```

----

### F# built in Result

```fsharp
type Result<'T,'TError> =
    | Ok of ResultValue:'T
    | Error of ErrorValue:'TError
```

----

#### Extending this to our general case

```fsharp
type Success = Sucesss
type Errors =
  | DBError
  | IOError
  | VerificationError
  /// ...

let ourUseCase (): Result<Success, Errors> =
    failwith ""
let ourUseCase2 (): Result<Success, Errors list> =
    failwith ""
```

----

#### Return and Bind

```fsharp
// Return
type Bricks = {desc: string; numBricks: int}
let ok = Ok {desc = "A Castle"; numBricks = 2133}
let error = Error "Lego crashed"

// Bind
let result: Result<int, string> =
   Result.bind (fun (lego: Bricks) -> Ok lego.numBricks) ok
// Result.bind ('T -> Result<'U, 'TError>) 
//        -> Result<'T, 'TError>
//        -> Result<'U, 'TError>
```

----

#### Monad to the Rescue

<iframe src="https://giphy.com/embed/l0Hlxvd5L0Qrn4JP2" width="480" height="270" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/southparkgifs-l0Hlxvd5L0Qrn4JP2">via GIPHY</a></p>

----

* return - wraps a data type in monand type
* bind - transform the encapsulated value by a function `'A -> M<'B>` 

```fsharp
val return: 'A -> M<'A>
val bind: ('A -> M<'B>) -> M<'A> -> M<'B>
```

Note: 

This is not all there are to Monads :)

There are some monadic laws also.

----

### Example

```fsharp
type person = {email: string; name: string}
let validatePerson input =
  if validEmail (fst input) then
    Error "Email not valid"
  elif validName (snd input) then
    Error "Name not valid"
  else
    Ok {email = fst input; name = snd input }
```

note:

```fsharp
let validEmail (str: string) =
  not (str.Contains("@"))
let validName (str: string) =
  not (str.Contains(" "))
```

----

#### Other tools 

* `map` for non-monadic types
* parallel monadic functions
* domain events / logging etc.


---

### Composition <!-- .element style="color:white" -->

<!-- .slide: data-background-image="./img/compose.jpg" -->

----

#### 

```fsharp
type person = {email: string; name: string}
let validatePerson input =
  if validEmail (fst input) then
    Error "Email not valid"
  elif validName (snd input) then
    Error "Name not valid"
  else
    Ok {email = fst input; name = snd input }

let readSSN (person: Person): Result<string, SSN> = 
  failwith ""
```

So how to compose these functions?

----

#### Input -> Output

* We have a buch a functions on the form
  * `'Input -> Result<'Error, 'Output>`
* all taking a single input and returning Result/Either consisting of:
  * an result or
  * an error

----

#### Composing in general

* Functions like: <br/>`f1: 'A -> 'B` and `f2: 'B -> 'C`<br/> can be composed
  * `f1 >> f2`
* Or <br/>`f3: ('A*'B) -> ('C*'D)` and </br>`f4: ('C*'D) -> ('E*'F)`
  * `f3 >> f4`
* So ordinary functions or function `'Input -> 'Result` is easy to compose

----

#### Creating an adapter

To compose functions liked `'A -> Result<'B, 'E>` we need an adapter

`bind` to the rescue

```fsharp
let bind func =
  fun input ->
    match input with
    | Ok value -> func value
    | Error e  -> Error e

let converted = bind validatePerson
// val: converted: Result<'A, 'E> -> Result<'B, 'E>
```


Note:

This takes a function as input, a function that with a single input and retuning a Result (`'A -> Result<'B, 'E>`)

And a value of the type `'Result<'A, 'E>`

Then it either return
* If input is an error, just output the error.
* If there is a value, then apply the given function

----

#### Altertive implementation

```fsharp
let bind2 func input =
  match input with
      | Ok value -> func value
      | Error e  -> Error e

let bind3 func = function
  | Ok value -> func value
  | Error e  -> Error e
```

**Note**: Both functions doing excatly the same as the above one. 

Note:

Due to currying

```fsharp
let (>>=) twoTrackInput switchFunction = 
    bind switchFunction twoTrackInput
```

----

#### Using std. composition

```fsharp
let combinedValidation =
  let validated2' = bind validated2 
  let validated3' = bind validated3

  validated1 >> validated2' >> validated3'
```

Note:

```fsharp
  let bind func =
    fun input ->
      match input with
      | Ok value -> func value
      | Error e  -> Error e

  let validated1 str =
    if (str = "ok") then
      Ok str
    else
      Error "Error 1"
    
  let validated2 (str:string) =
    if (str.ToUpper() = "OK") then
      Ok (str.ToUpper())
    else
      Error "Error 2"

  let validated3 (str: string) =
    if (str.Contains("O")) then
      Ok "Contains 'o'"
    else
      Error "Error 3"
  // I know this does not make so much sense.
```

----

#### The same with `>>=` operator

```fsharp
let validate x =
  x
  |>  validated1
  >>= validated2
  >>= validated3
```

Data vs function oriented method - but same result.

Note:

```fsharp
let (>>=) twoTrackInput switchFunction = 
    bind switchFunction twoTrackInput
```

---

### Convertion

Alternative to the above method, we can convert 

```fsharp
val a: 'A -> Result<'B, 'D>
val b: 'B -> Result<'C, 'D>

// into

val aAndB: 'A -> Result<'C, 'D>
```

----

```fsharp
let (>=>) aFun bFun x =
 match aFun x with
 | Ok y    -> bFun y
 | Error e -> Error e

// Usage
let combinedValidation =
  validated1
  >=> validated2
  >=> validated3
```

Note:

`>=>` implemented with bind

```fsharp
let (>=>) aFun bFun =
  aFun >> (bind bFun)
```

----

#### Comparision

* **`Bind`** - Converts a 'switch function' into what blog calls a 'two-track function'
  * Used when combining single function
* **`SwitchComposition`** - Converts two 'switch functions' into a single new 'switch function'
  * Chaining a number of functions together

----

#### Composing with simple functions 

```fsharp
let cannotFail input = input

// Convert to 'A -> Result<'A, 'TError>

let switch f input =
  f input |> Ok
```

----

#### Functions with side effects

* E.g.
  * Save output
  * Log

```fsharp
let log msg: unit = printfn "-- %O" msg

let tee f x =
  f x |> ignore
  x

let combinedValidation =
  validated1
  >=> validated2
  >=> validated3
  >=> switch (tee log)
```

---

### Exceptions

Our code can throw exceptions and we should be able to handle than in our flow

```fsharp
let doStuff input = invalidArg "input" "always wrong"

let tryCatch f input =
  try
    f input |> Ok
  with
    | ex -> Error ex.Message

let combinedValidation =
  validated1
  >=> validated2
  >=> validated3
  >=> tryCatch (tee doStuff)
```

Note:

```fsharp
let doStuff (input: string) = 
  if input.ToUpper() = "OK"
  then (printfn "fine")
  else invalidArg "input" "was all wrong"
```

----

### Parallel validation

Lets think fold :) combining pairwise

```fsharp
let plus combineOks combineErrors switch1 switch2 x = 
    match (switch1 x),(switch2 x) with
    | Ok s1, Ok s2       -> Ok (combineOks s1 s2)
    | Error f1, Ok _     -> Error f1
    | Ok _ , Error f2    -> Error f2
    | Error f1, Error f2 -> Error (combineErrors f1 f2)
```


---

### References

* Some images from: https://swlaschin.gitbooks.io/fsharpforfunandprofit/content/posts/recipe-part1.html
