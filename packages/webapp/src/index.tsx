import {
  ApolloClient,
  ApolloProvider,
  gql,
  InMemoryCache,
  useMutation,
  useQuery,
} from '@apollo/client'
import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
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

const UPDATE_POST_MUTATION = gql`
  mutation ($id: String, $title: String, $body: String) {
    update(id: $id, title: $title, body: $body) {
      id
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

interface PostPreviewProps {
  post: Post
}

const PostPreview = ({ post }: PostPreviewProps) => {
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

const WritePostContainer = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const params: { id?: string } = useParams()

  const [update, { data }] = useMutation<{ update: { id: string } }>(
    UPDATE_POST_MUTATION,
    {
      variables: {
        id: params.id,
        title,
        body,
      },
    },
  )

  useEffect(() => {
    if (!params.id && title && body) {
      update()
    }
  }, [params.id, title, body])

  const navigate = useNavigate()

  useEffect(() => {
    if (data?.update.id) {
      navigate(`/write/${data.update.id}`, { replace: true })
    }
  }, [data?.update.id])

  const onClickPublish = () => {
    update()
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex flex-col gap-4 items-end">
        <input
          className="p-4 border-gray-400 border w-full"
          placeholder="Because I could not stop for Death..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="p-4 border-gray-400 border w-full h-96"
          placeholder="He kindly stopped for me..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        ></textarea>
        <button
          className="py-2 px-4 bg-green-700 text-white text-sm rounded-full disabled:opacity-50 transition-opacity"
          onClick={onClickPublish}
          disabled={!title.length || !body.length}
        >
          Publish
        </button>
      </div>
    </div>
  )
}

const PostsContainer = () => {
  const { data } = useQuery<{ posts: Post[] }>(POSTS_QUERY)
  return (
    <div className="flex flex-col">
      {data &&
        data.posts.map((post, i) => (
          <div key={post.id} className={i !== 0 ? 'mt-8' : ''}>
            <PostPreview post={post} />
          </div>
        ))}
      <div className="mt-8 p-4 text-center rounded-md bg-gray-200">
        {Math.random() > 0.5
          ? `You've got ideas, set them free.`
          : `Let your imagination run wild.`}{' '}
        <Link
          className="ml-2 py-2 px-4 bg-black text-white text-sm rounded-full"
          to="/write"
        >
          Write something
        </Link>
      </div>
    </div>
  )
}

const Home = () => {
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
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<Home />} />
          <Route path="/write" element={<WritePostContainer />} />
          <Route path="/write/:id" element={<WritePostContainer />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
  root,
)
