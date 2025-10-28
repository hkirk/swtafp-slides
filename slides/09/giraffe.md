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

* Standalized way of making web resources available<!-- .element: class="fragment" --> 
  * API
  * Content
* Web frameworks for all language<!-- .element: class="fragment" --> 
  * C#, Java, php, ... Python, js, ...

----

### ASP.NET

* .NET based web framework<!-- .element: class="fragment" --> 
  * made for C#
* Supports a wide range of applications<!-- .element: class="fragment" --> 
  * Web pages
  * MVC
  * Web API
  * Web Hooks
* Normally runs in the IIS container<!-- .element: class="fragment" --> 

----

### Giraffe

* (micro) Web framework build as middleware to ASP.NET Core<br/><!-- .element: class="fragment" --> 
* Make use of 'all' build in middlewares<br/><!-- .element: class="fragment" --> 
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

---

### Setting up Giraffe

* Install Giraffe nuget package in F# project
  * `PM> Install-Package Giraffe`


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

```fsharp [5-6]
let configureServices (services: IServiceCollection) =
    // Add Giraffe to the ASP.NET Core pipeline
    services.AddGiraffe() |> ignore
    
let notFoundHandler = "Not Found" |> text 
                                  |> RequestErrors.notFound

let configureApp (appBuilder: IApplicationBuilder) =
    appBuilder
    // Add Giraffe dependencies
    .UseGiraffe(notFoundHandler)
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

### Defining Giraffe middlewere

```fsharp [7-12]
let configureServices (services: IServiceCollection) =
    // Add Giraffe to the ASP.NET Core pipeline
    services.AddGiraffe() |> ignore
    
let notFoundHandler = "Not Found" |> text |> RequestErrors.notFound

let configureApp (appBuilder: IApplicationBuilder) =
    appBuilder
    // Add Giraffe dependencies: CORS, Auth, ...
    .UseGiraffe(notFoundHandler)
```

---


### `HttpHandler`

```fsharp
type HttpFuncResult = Task<HttpContext option>
type HttpFunc = HttpContext -> HttpFuncResult
type HttpHandler = HttpFunc -> HttpContext -> HttpFuncResult
```

* Has a bind method (called compose)<br/><!-- .element: class="fragment" -->
* and a operator (>=>)<br/><!-- .element: class="fragment" -->

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
let todo: Endpoint =
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
* Should look much like something we already know from last week.<!-- .element: class="fragment" -->


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
<!-- .element: class="fragment" -->


----

### `Compose`

* Operator (>=>)<br/><!-- .element: class="fragment" data-fragment-index="0" -->
* build on bind, but is optimized<br/><!-- .element: class="fragment" data-fragment-index="1" -->
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

* To avoid functions be eagerly loaded<br/><!-- .element: class="fragment"   data-fragment-index="1" -->

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
    route "/foo" >=> text "Foo"
    route "/bar" >=> text "Bar"
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
* <!-- .element: class="fragment" --><code>routeCi</code> - non exact match<br/>
  * `route "/info" >=> info`
* <!-- .element: class="fragment" --><code>routex</code> - regex<br/>
  * `routex "/info(/?)' >=> info`
* ....<br/><!-- .element: class="fragment" -->

----

### Routes and routing

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

app.UseGiraffe(webApp)
```


note: 

Giraffe 5.x

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

