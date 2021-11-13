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

interface PostContainerProps {
  post: Post
}

const PostContainer = ({ post }: PostContainerProps) => {
  return (
    <div className="mt-8 flex justify-between">
      <div className="flex flex-col">
        <div className="font-semibold text-xs">
          {post.author}{' '}
          <span className="text-gray-600 font-light">&middot; Nov 13</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold">{post.title}</h2>
      </div>
      <img src={post.image} alt="" />
    </div>
  )
}

const PostsContainer = () => {
  const { data } = useQuery<{ posts: Post[] }>(POSTS_QUERY)
  return (
    <div className="flex flex-col">
      {data &&
        data.posts.map((post) => <PostContainer key={post.id} post={post} />)}
      <div className="mt-8 p-4 text-center rounded-md bg-gray-200">
        You've got ideas, set them free.{' '}
        <button className="ml-2 py-2 px-4 bg-black text-white text-sm rounded-full">
          Write something
        </button>
      </div>
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
