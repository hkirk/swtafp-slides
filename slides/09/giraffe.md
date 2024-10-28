<!-- .slide: data-background="#003d73" -->
## Web development with Giraffe 

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

## Agenda

* Web Framework
  * ASP.NET
  * Giraffe
* HttpHandlers
* 

---

### Web frameworks

* Standalized way of making web resources available
  * API
  * Content
* Web frameworks for all language
  * C#, Java, php, ... Python, js, ...

----

### ASP.NET

* .NET based WebFramework
  * made for C#
* Supports a wide range of applications
  * Web pages
  * MVC
  * Web API
  * Web Hooks
* Normally runs in the IIS container

----

### Giraffe

* (micro) Web framework build as middleware to ASP.NET Core
* Make use of 'all' build in middlewares
  * static file, authentication, authorization, ..
* Built as a Functional framework (which we like)
* Very simple concept

```fsharp
type HttpFuncResult = Task<HttpContext option>
type HttpFunc = HttpContext -> HttpFuncResult
type HttpHandler = HttpFunc -> HttpContext -> HttpFuncResult
```

---

### `HttpHandler`

* Has a bind method (now called compose)
* and a operator (>=>)
* plus some more (as we will see below)

----

### Prebuilt `HttpHandler`s

* using a prebuilt HttpHandler
  * e.g. `text`, `json`, `setBody`, `GET`, `POST`, `compose`

```fsharp
let sayHelloWorld : HttpHandler = text "Hello World, from Giraffe"
```

----

### Using `HttpFunc` to create `HttpHandler`

* When you need access to the HttpContext
```fsharp
// type HttpHandler = HttpFunc -> HttpContext -> HttpFuncResult
let todo: Endpoint =
    fun next ctx ->
        ServerErrors.NOT_IMPLEMENTED "" next ctx
```
* Applying 'next' and 'ctx' to then subsequent handler.


----

### Explicitly handling async operations

```fsharp
let sayHelloWorld : HttpHandler =
  fun (next : HttpFunc) (ctx : HttpContext) ->
    task {
      let! person = ctx.BindJsonAsync<Person>()
      let greeting = sprintf "Hello World, from %s" person.Name
      return! text greeting next ctx
    }
```

----

### Bind implementation

```fsharp
//Note: concept code
let bind (handler : HttpHandler) (handler2 : HttpHandler) =
    fun (ctx : HttpHandlerContext) ->
        async {
            let! result = handler ctx
            match result with
            | None      -> return None
            | Some ctx2 ->
                match ctx2.HttpContext.Response.HasStarted with
                | true  -> return  Some ctx2
                | false -> return! handler2 ctx2
        }
```

* Should look much like something we already know from last week.


----

### `Compose`

* Operator (>=>)
* builds on bind, but is an optimzed version
* E.g.

```fsharp
let app = compose (route "/") (Successful.OK "Hello World")
// or
let app = route "/" >=> Successful.OK "Hello World"
```

----

### `Choose`

* HttpHandler
* Iterates throgh multiple HttpHandlers and apply fist that fits

```fsharp
let app =
  choose [
    route "/foo" >=> text "Foo"
    route "/bar" >=> text "Bar"
  ]
```

----

### `Warbler`

* Used when you don't want to return static content
```fsharp
// ('a -> 'a -> 'b) -> 'a -> 'b
let warbler f a = f a a
```
* To avoid functions be eagerly loaded
```fsharp [7]
// unit -> string
let time() = System.DateTime.Now.ToString()

let App =
    choose [
        route "/normal"  >=> text (time())
        route "/warbler" >=> warbler (fun _ -> text (time()))
    ]
```

---

### Setting up Giraffe

* Install Giraffe nuget package in F# project
  * `PM> Install-Package Giraffe`


```fsharp [7-8]
[<EntryPoint>]
let main _ =
    Host.CreateDefaultBuilder()
        .ConfigureWebHostDefaults(
            fun webHostBuilder ->
                webHostBuilder
                    .Configure(configureApp)
                    .ConfigureServices(configureServices)
                    |> ignore)
        .Build()
        .Run()
    0
```

----

### Defining Giraffe middlewere

```fsharp
let webApp = ...

let configureApp (app : IApplicationBuilder) =
    // Add Giraffe to the ASP.NET Core pipeline
    app.UseGiraffe webApp

let configureServices (services : IServiceCollection) =
    // Add Giraffe dependencies
    services.AddGiraffe() |> ignore
```

----

### Routing

* Is also an `HttpHandler`
* 'route' being the main
  * `route '/info' >=> info`
* 'routeCi' - non exact match
  * `route '/info` >=> info`
* 'routex' - regex
  * `routex '/info(/?)' >=> info`
* ....

----

### Endpoint routing

```fsharp [1, 6]
let endpoints =
  [] // a list of enpoints
let configureApp (appBuilder : IApplicationBuilder) =
  appBuilder
      .UseRouting()
      .UseEndpoints(fun e -> e.MapGiraffeEndpoints(endpoints))
  |> ignore
```

note:
```fsharp
let endpoints =
  [
    GET [
      route "/" (text "Hello World")
      routef "/%s/%i" handler2
      routef "/%s/%s/%s/%i" handler3
    ]
    subRoute "/sub" [
      // Not specifying a http verb means it will listen to all verbs
      route "/test" handler1
    ]
  ]
```

----

## References

* [Reasoning behind creating Giraffe](https://dusted.codes/functional-aspnet-core)

