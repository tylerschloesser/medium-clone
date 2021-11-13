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
      image
    }
  }
`

interface Post {
  id: string
  title: string
  author: string
  image: string
}

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
})

const root = document.getElementById('root')!

const PostsContainer = () => {
  const { data } = useQuery<{ posts: Post[] }>(POSTS_QUERY)
  return (
    <div className="flex flex-col">
      {data &&
        data.posts.map((post) => (
          <div key={post.id} className="mt-8 flex justify-between">
            <div className="flex flex-col">
              <h2>{post.title}</h2>
              <div>{post.author}</div>
            </div>
            <img src={post.image} alt="" />
          </div>
        ))}
    </div>
  )
}

const App = () => {
  return (
    <div className="container mx-auto">
      <div className="flex">
        <div className="flex-2 mr-8">
          <PostsContainer />
        </div>
        <div className="flex-1">
          <div className="mt-8 p-6 rounded-md bg-blue-200">
            <div className="font-light uppercase text-sm">Hey There 👋</div>
            <div className="mt-4">Welcome to my medium clone!</div>
          </div>
        </div>
      </div>
    </div>
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
