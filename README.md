# lokka

Simple JavaScript client for GraphQL.

## Installation

Install lokka and a transport layer:

```
npm i --save lokka lokka-transport-http
```

> Here we'll be using Lokka's [HTTP transport layer](https://github.com/kadirahq/lokka-transport-http) which is compatible with [express-graphql](https://github.com/graphql/express-graphql).

## Usage

We can initialize a Lokka client like this:

```js
import Lokka from 'lokka';
// const Lokka = require('lokka').Lokka;
import HttpTransport from 'lokka-transport-http';
// const HttpTransport = require('lokka-transport-http').HttpTransport;

const client = new Lokka({
    transport: new HttpTransport('http://graphql-swapi.parseapp.com/')
});
```

> Here we connect lokka to Facebook's [SWAPI GraphQL Demo](http://graphql-swapi.parseapp.com/).

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
      producers,
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
    console.log(result.allFilms);
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

## Demo App

We've just look at features of lokka. Let's have look at demo where you can play with. Check this repo: <https://github.com/kadira-samples/simple-lokka-demo>

## Future Development

In this version of lokka, it's just a basic API where you can query against a GraphQL Schema. This API is stable.

We'll have more features in the future versions of lokka.

* 1.x.x [Latest] - Query/Mutate against a GraphQL schema.
* 2.x.x - Client side query validations.
* 3.x.x - Client side smart cache.
* 4.x.x - Subscriptions Support.
