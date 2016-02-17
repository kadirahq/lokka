# lokka

Simple GraphQL client for JavaScript. 

Works on all the JavaScript environments including **Browser**, **NodeJS** and **React Native**.

## TOC

* [Installation](#installation)
* [Usage](#usage)
* [Core API](#core-api)
* [Cache API](#cache-api)
* [Demo Apps](#demo-apps)
* [Future Development](#future-development)

## Installation

Install lokka and a transport layer:

```
npm i --save lokka lokka-transport-http
```

> Here we'll be using Lokka's [HTTP transport layer](https://github.com/kadirahq/lokka-transport-http) which is compatible with [express-graphql](https://github.com/graphql/express-graphql).

## Usage

We can initialize a Lokka client like this:

```js
const Lokka = require('lokka').Lokka;
const Transport = require('lokka-transport-http').Transport;

const client = new Lokka({
  transport: new Transport('http://graphql-swapi.parseapp.com/')
});
```

> Here we connect lokka to Facebook's [SWAPI GraphQL Demo](http://graphql-swapi.parseapp.com/).

## Core API

### Basic Querying

Then you can invoke a simple query like this:
(This query will get titles of all the Star Wars films)

```js
client.query(`
    {
      allFilms {
        films {
          title
        }
      }
    }
`).then(result => {
    console.log(result.allFilms);
});
```

### Using Fragments

You can also create fragments and use inside queries.

Let's define a fragment for the `Film` type.

```js
const filmInfo = client.createFragment(`
  fragment on Film {
    title,
    director,
    releaseDate
  }
`);
```

> NOTE: Here's you don't need to give a name to the fragment

Let's query all the films using the above fragment:

```js
client.query(`
  {
    allFilms {
      films {
        ...${filmInfo}
      }
    }
  }
`).then(result => {
  console.log(result.allFilms.films);
});
```

> We can also use fragments inside fragments as well. Lokka will resolve fragments in nested fashion.

### Mutations

GraphQL Swapi API, does not have mutations. If we had mutations we could invoke them like this:

```js
client.mutate(`
    newFilm: createMovie(
        title: "Star Wars: The Force Awakens",
        director: "J.J. Abrams",
        producers: [
            "J.J. Abrams", "Bryan Burk", "Kathleen Kennedy"
        ],
        releaseDate: "December 14, 2015"
    ) {
        ...${filmInfo}
    }
`).then(response => {
    console.log(response.newFilm);
});
```

> Normally, when we are sending a GraphQL mutation we write it like below:
>
> ```
> mutation someNameForRequest {
>   newFilm: createMovie(...) {
>     ...
>   }
> }
> ```
>
> But with lokka, you don't need to write `mutation someNameForRequest` part. Lokka will add it for you.

### Query Variables

We can use [query variables](https://learngraphql.com/basics/query-variables) when querying the schema.

```js
const query = `
  query sumNow($a: Int, $b: Int) {
    sum(a: $a, b: $b)
  }
`;

const vars = {a: 10, b: 30};
client.query(query, vars).then(result => {
  console.log(result.sum);
});
```

## Cache API

Lokka has a built in cache. But it won't be used when you are invoking the core API. For that, you need to use following APIs:

### Lokka.watchQuery()

This API allows to watch a query. First it will fetch the query and cache it. When the cache updated, it'll notify the change. Here's how to use it.

```js
// create a query with query variables (query variables are not mandatory)
const query = `
  query _($message: String!) {
    echo(message: $message)
  }
`;
// object pass as the query variables
const vars = {message: 'Hello'};

// create a lokka client with a transport
const client = new Lokka({...});

// watch the query
const watchHandler = (err, payload) => {
  if (err) {
    console.error(err.message);
    return;
  }

  console.log(payload.echo);
};
const stop = client.watchQuery(query, vars, watchHandler);

// stop watching after a minute
setTimeout(stop, 1000 * 60);
```


### Lokka.refetchQuery()

Refetch a given query and update the cache:

```js
client.watchQuery(query, {message: 'Hello Again'});
```

This will notify all the watch handlers registered with `BlogSchema.watchQuery`.

### Lokka.cache.getItemPayload()

Get the item inside the cache for a query.

```js
const payload = client.cache.getItemPayload(query, vars);
```

### Lokka.cache.setItemPayload()

Set the item inside the cache. New value will be send to all registered watch handlers.

```js
client.cache.setItemPayload(query, vars, payload);
```

> Payload must to identical to what's receive from the GraphQL.

### Lokka.cache.removeItem()

With this we can remove the query and vars combo from the cache. But this won't notify watch handers.

```js
client.cache.removeItem(query, vars);
```

### Lokka.cache.fireError()

Fire an error for all the registered watchHandlers.

```js
client.cache.removeItem(query, vars, new Error('some error'));
```

## Demo Apps

Have a look at some sample apps:

* [Client Side App](https://github.com/kadira-samples/react-graphql-todos)
* [React Native App](https://github.com/kadira-samples/react-native-graphql-demo)
* [Blog App with Meteor](https://github.com/kadira-samples/meteor-graphql-demo)

## Future Development

In this version of lokka, it's just a basic API where you can query against a GraphQL Schema. This API is stable.

We'll have more features in the future versions of lokka.

* 1.x.x - Query/Mutate against a GraphQL schema.
  * support for query variables.
  * query watching support.
  * [current] basic client side cache.
* 2.x.x - Client side query validations.
* 3.x.x - Client side smart cache.
* 4.x.x - Subscriptions Support.
