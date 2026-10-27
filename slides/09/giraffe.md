<!-- .slide: data-background="#003d73" -->
## Web development with Giraffe 

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

## Agenda

* Web Framework
  * ASP.NET
  * Giraffe
* HttpHandlers

---

### Web frameworks

* Standardized way of making web resources available<!-- .element: class="fragment" --> 
  * API
  * Content
* Web frameworks exists for all languages<!-- .element: class="fragment" --> 
  * C#, Java, php, ... Python, js, ...

----

### ASP.NET

* .NET based web framework<!-- .element: class="fragment" --> 
  * designed with C# in mind
* Supports a wide range of applications<!-- .element: class="fragment" --> 
  * Web pages
  * MVC
  * Web API
  * SignalR
* Runs in the Kestrel by default<!-- .element: class="fragment" --> 

----

### Giraffe

* (micro) Web framework built as middleware to ASP.NET Core<br/><!-- .element: class="fragment" --> 
* Make use of 'all' built-in middleware<br/><!-- .element: class="fragment" --> 
  * static file, authentication, authorization, ..
* Built as a functional framework <!-- .element: class="fragment" --> 
  * which we like :) <br/>
* Very simple concept<br/><!-- .element: class="fragment" --> 

```fsharp
type HttpFuncResult = Task<HttpContext option>
type HttpFunc = HttpContext -> HttpFuncResult
type HttpHandler = HttpFunc -> HttpContext -> HttpFuncResult
```
<!-- .element: class="fragment" --> 

note:

* HttpFuncResult:
  * A Task<HttpContext option> representing the asynchronous result of an HTTP operation.
* HttpFunc:
  * A function HttpContext -> HttpFuncResult that takes a HttpContext and returns an HttpFuncResult.
  * Acts as a middleware step in Giraffe’s pipeline.
* HttpHandler:
  * A function HttpFunc -> HttpContext -> HttpFuncResult that composes with the next HttpFunc in the pipeline.
  * Signature: (next: HttpFunc) -> (ctx: HttpContext) -> HttpFuncResult.
  * Example: GET >=> route "/hello" >=> text "Hello World".


----

## Hello world

```fsharp [13-21| 8-11]
module GiraffeHelloWorld.App

open System
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.DependencyInjection
open Giraffe

let endpoints = 
  choose [
      route "/" >=> text "Hello World, from Giraffe"
  ]

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)
    builder.Services.AddGiraffe() |> ignore

    let app = builder.Build()
    app.UseRouting().UseGiraffe(endpoints)
    app.Run()
    0
```

---

### Setting up Giraffe

* Install Giraffe nuget package in F# project
  * `% dotnet add package Giraffe`


```fsharp [3-4]
[<EntryPoint>]
let main _ =
    let builder = WebApplication.CreateBuilder(args)
    configureServices builder.Services

    let app = builder.Build()

    configureApp app
    app.Run()
    0
```

----

### Defining Giraffe Services

```fsharp [1-3]
let configureServices (services: IServiceCollection) =
    // Add Giraffe to the ASP.NET Core pipeline
    services.AddGiraffe() |> ignore
    
let notFoundHandler = 
  RequestErrors.notFound (text "Not Found")

let configureApp (appBuilder: IApplicationBuilder) =
    appBuilder
    // Add Giraffe dependencies
    .UseGiraffe(notFoundHandler )
```


----

```fsharp [6| 8]
[<EntryPoint>]
let main _ =
    let builder = WebApplication.CreateBuilder(args)
    configureServices builder.Services

    let app = builder.Build()

    configureApp app
    app.Run()
    0
```

----

### Defining Giraffe middleware

```fsharp [7-12]
let configureServices (services: IServiceCollection) =
    // Add Giraffe to the ASP.NET Core pipeline
    services.AddGiraffe() |> ignore
    
let notFoundHandler = 
  RequestErrors.notFound (text "Not Found")

let configureApp (appBuilder: IApplicationBuilder) =
    appBuilder
    // Add Giraffe dependencies: CORS, Auth, ...
    .UseCors(..)
    .UseGiraffe(notFoundHandler)
```

* Demo returns 404 on al request

---


### `HttpHandler`

```fsharp
type HttpFuncResult = Task<HttpContext option>
type HttpFunc = HttpContext -> HttpFuncResult
type HttpHandler = HttpFunc -> HttpContext -> HttpFuncResult
```

* Has a bind method (called compose)<br/><!-- .element: class="fragment" -->
* and an operator (>=>)<br/><!-- .element: class="fragment" -->

----

### Prebuilt `HttpHandler`s

* using a prebuilt HttpHandler
  * e.g. `text`, `json`, `setBody`, `GET`, `POST`, `compose`

```fsharp
let sayHelloWorld : HttpHandler = text "Hello World, from Giraffe"
```

----

### Using `HttpFunc` to create `HttpHandler`

```fsharp
// type HttpHandler = HttpFunc -> HttpContext -> HttpFuncResult
// type HttpFunc = HttpContext -> HttpFuncResult
let todo: HttpHandler =
    // e.g. get input/database etc.
    fun next ctx ->
        ServerErrors.NOT_IMPLEMENTED "" next ctx
```
* When you need access to the HttpContext<br/><!-- .element: class="fragment" -->
* <!-- .element: class="fragment" -->Need to apply 'next' and 'ctx' to the subsequent <code>HttpHandler</code><br/>

note:

Use context for json, access to the request etc..

----

### Explicitly handling async operations

```fsharp [3,4,6,7]
let sayHelloWorld : HttpHandler =
  fun (next : HttpFunc) (ctx : HttpContext) ->
    task {
      let! person = ctx.BindJsonAsync<Person>()
      let greeting = sprintf "Hello World, from %s" person.Name
      return! text greeting next ctx
    }
```

---

## Routing <!-- .element: style="text-shadow: 0 0 30px #000;" -->

<!-- .slide: data-background-image="img/routing.jpg" -->

----

### Bind implementation

* Http Handlers can be chained<br/><!-- .element: class="fragment" -->
* Should look familiar from earlier<!-- .element: class="fragment" -->


```fsharp
//Note: concept code
let bind (handler : HttpHandler) (handler2 : HttpHandler) =
    fun (ctx : HttpContext) ->
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
<!-- .element: class="fragment" -->


----

### `Compose`

* Operator (>=>) (Kleisli composition)<br/><!-- .element: class="fragment" data-fragment-index="0" -->
* built on bind, but is optimized<br/><!-- .element: class="fragment" data-fragment-index="1" -->
* E.g.:<br/><!-- .element: class="fragment" data-fragment-index="2" -->
```fsharp
let app = compose (route "/") (Successful.OK "Hello World")
// or
let app = route "/" >=> Successful.OK "Hello World"
```
<!-- .element: class="fragment" data-fragment-index="2" -->

----

### `Warbler`

* Used when you don't want to return static content<br/><!-- .element: class="fragment" data-fragment-index="0" -->
  * and don't need context

```fsharp
// ('a -> 'a -> 'b) -> 'a -> 'b
let warbler f a = f a a
```
<!-- .element: class="fragment"   data-fragment-index="0" -->

* To avoid functions being eagerly evaluated<br/><!-- .element: class="fragment"   data-fragment-index="1" -->

```fsharp [7]
// unit -> string
let time() = System.DateTime.Now.ToString()

let App =
    choose [
        route "/normal"  >=> text (time())
        route "/warbler" >=> warbler (fun _ -> text (time()))
    ]
```
<!-- .element: class="fragment" data-fragment-index="1" -->

----

### `Choose`

```fsharp
let app =
  choose [
    GET >=> route "/foo" >=> text "Foo"
    GET >=> route "/bar" >=> text "Bar"
  ]
```
* A HttpHandler<br/><!-- .element: class="fragment" -->
* Iterates through multiple HttpHandlers<br/><!-- .element: class="fragment" -->
  * apply first that fits
* Can be nested<br/><!-- .element: class="fragment" -->

----

### `route`

* <!-- .element: class="fragment" -->Also a <code>HttpHandler</code><br/>
* <!-- .element: class="fragment" --><code>route</code> being the main<br/>
  * `route "/info" >=> info`
* <!-- .element: class="fragment" --><code>routeCi</code> - case-insensitive<br/>
  * `routeCi "/info" >=> info`
* <!-- .element: class="fragment" --><code>routex</code> - regex<br/>
  * `routex "/info(/?)" >=> info`
* ....<br/><!-- .element: class="fragment" -->

----

### Routes and routing

```fsharp
let endpoints =
  [
    GET [
      route "/" (text "Hello World")
      routef "/%s/%i" (fun (name, age) -> text "")
      routef "/%s/%s/%s/%i" (fun (fn, mn, ls, age) -> text "")
    ]
    subRoute "/moduleA" [
      route "/test" (text "test")
    ]
  ]

app.UseGiraffe(endpoints)
```


note: 

## Old Giraffe 5.x syntax

```fsharp [1, 6]
let endpoints =
  [] // a list of endpoints
let configureApp (appBuilder : IApplicationBuilder) =
  appBuilder
      .UseRouting()
      .UseEndpoints(fun e -> e.MapGiraffeEndpoints(endpoints))
  |> ignore
```

----

## References

* [Reasoning behind creating Giraffe](https://dusted.codes/functional-aspnet-core)

