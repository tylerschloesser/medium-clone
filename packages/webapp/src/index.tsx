import React from 'react'
import ReactDom from 'react-dom'

import {
  ApolloClient,
  ApolloProvider,
  gql,
  InMemoryCache,
  useQuery,
} from '@apollo/client'

const TEST_QUERY = gql`
  query {
    hello
  }
`

const POSTS_QUERY = gql`
  query {
    posts {
      id
      title
      author
    }
  }
`

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
})

const root = document.getElementById('root')!

const App = () => {
  const { data } = useQuery(POSTS_QUERY)
  return <h1>data: {JSON.stringify(data)}</h1>
}

ReactDom.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  root,
)
