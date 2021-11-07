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

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
})

const root = document.getElementById('root')!

const App = () => {
  const { data } = useQuery(TEST_QUERY)
  return <h1>data: {data}</h1>
}

ReactDom.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  root,
)
