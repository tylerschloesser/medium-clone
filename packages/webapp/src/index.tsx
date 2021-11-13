import React from 'react'
import ReactDom from 'react-dom'

import 'tailwindcss/tailwind.css'

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

interface Post {
  id: string
  title: string
  author: string
}

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
})

const root = document.getElementById('root')!

const App = () => {
  const { data } = useQuery<{ posts: Post[] }>(POSTS_QUERY)
  return (
    <>
      <div className="container mx-auto">
        {data &&
          data.posts.map((post) => (
            <div key={post.id} className="flex">
              <div className="flex">
                <h2>{post.title}</h2>
                <div>{post.author}</div>
              </div>
            </div>
          ))}
      </div>
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img className="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo" />
        </div>
        <div>
          <div className="text-xl font-medium text-black">ChitChat</div>
          <p className="text-gray-500">You have a new message!</p>
        </div>
      </div>
    </>
  )
}

ReactDom.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  root,
)
