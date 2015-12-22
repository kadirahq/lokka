# lokka

Simple JavaScript client for GraphQL. 

Works on all the JavaScript environments including **Browser**, **NodeJS** and **React Native**.

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

## Demo Apps

Have a look at some sample apps:

* [Client Side App](https://github.com/kadira-samples/react-graphql-todos)
* [React Native App](https://github.com/kadira-samples/react-native-graphql-demo)

## Future Development

In this version of lokka, it's just a basic API where you can query against a GraphQL Schema. This API is stable.

We'll have more features in the future versions of lokka.

* 1.x.x [Latest] - Query/Mutate against a GraphQL schema.
  * support for query variables
* 2.x.x - Client side query validations.
* 3.x.x - Client side smart cache.
* 4.x.x - Subscriptions Support.
