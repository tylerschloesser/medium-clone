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
    <>
      {data &&
        data.posts.map((post) => (
          <div key={post.id} className="m-8 flex justify-between">
            <div className="flex flex-col">
              <h2>{post.title}</h2>
              <div>{post.author}</div>
            </div>
            <img src={post.image} alt="" />
          </div>
        ))}
    </>
  )
}

const App = () => {
  return (
    <div className="container mx-auto">
      <PostsContainer />
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
