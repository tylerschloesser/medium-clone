import {
  ApolloClient,
  ApolloProvider,
  gql,
  InMemoryCache,
  useQuery,
} from '@apollo/client'
import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import 'tailwindcss/tailwind.css'

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
    <Link to={`/post/${post.id}`} className="flex justify-between">
      <div className="flex flex-col">
        <div className="font-semibold text-xs">
          {post.author}{' '}
          <span className="text-gray-600 font-light">&middot; Nov 13</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold">{post.title}</h2>
      </div>
      <img
        className="h-24 md:h-auto w-24 md:w-auto object-cover"
        src={post.image}
        alt=""
      />
    </Link>
  )
}

const NewPostContainer = () => {
  return <textarea></textarea>
}

const PostsContainer = () => {
  const { data } = useQuery<{ posts: Post[] }>(POSTS_QUERY)
  return (
    <div className="flex flex-col">
      {data &&
        data.posts.map((post, i) => (
          <div key={post.id} className={i !== 0 ? 'mt-8' : ''}>
            <PostContainer post={post} />
          </div>
        ))}
      <div className="mt-8 p-4 text-center rounded-md bg-gray-200">
        {Math.random() > 0.5
          ? `You've got ideas, set them free.`
          : `Let your imagination run wild.`}{' '}
        <Link
          className="ml-2 py-2 px-4 bg-black text-white text-sm rounded-full"
          to="/post/new"
        >
          Write something
        </Link>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex">
        <div className="flex-2">
          <PostsContainer />
        </div>
        <div className="flex-1 hidden md:block md:ml-8">
          <div className="p-6 rounded-md bg-blue-200">
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/post/new" element={<NewPostContainer />} />
          <Route path="/post/:id" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
  root,
)
