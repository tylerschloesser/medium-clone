import {
  ApolloClient,
  ApolloProvider,
  gql,
  InMemoryCache,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
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

const GET_POST_PREVIEWS_QUERY = gql`
  query GetPostPreviews($filter: PostFilter) {
    posts(filter: $filter) {
      id
      title
      author
      image
    }
  }
`

const POST_QUERY = gql`
  query GetPost($id: String!) {
    post(id: $id) {
      id
      title
      body
      image
    }
  }
`

const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost(
    $id: String
    $image: String
    $title: String!
    $body: String!
  ) {
    update(id: $id, image: $image, title: $title, body: $body) {
      id
      image
      title
      body
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
  const [local, setLocal] = useState({
    dirty: false,
    title: '',
    body: '',
    image: '',
  })

  const params: { id?: string } = useParams()

  const [getPost, postQuery] = useLazyQuery<
    { post: { title: string; body: string; image: string } },
    { id: string }
  >(POST_QUERY)

  useEffect(() => {
    if (params.id && !local.title && !local.body) {
      getPost({ variables: { id: params.id } })
    }
  }, [params.id, local])

  useEffect(() => {
    if (postQuery.data?.post) {
      const { post } = postQuery.data
      setLocal({
        dirty: false,
        ...post,
      })
    }
  }, [postQuery])

  const [update, { data }] = useMutation<{ update: { id: string } }>(
    UPDATE_POST_MUTATION,
    {
      variables: {
        id: params.id,
        title: local.title,
        body: local.body,
        image: local.image,
      },
    },
  )

  const debouncedUpdate = useCallback(debounce(update, 500), [update])

  useEffect(() => {
    if (local.title && local.body) {
      debouncedUpdate()
    }
  }, [local])

  const navigate = useNavigate()

  useEffect(() => {
    if (!params.id && data?.update.id) {
      navigate(`/write/${data.update.id}`, { replace: true })
    }
  }, [params.id, data?.update.id])

  const onClickPublish = () => {
    update()
  }

  return (
    <div className={`container mx-auto p-4 sm:p-8`}>
      <div className="flex flex-col gap-4 items-end">
        <input
          className="p-4 border-gray-400 border w-full text-xl"
          placeholder="Because I could not stop for Death..."
          value={local.title}
          onChange={(e) =>
            setLocal((prev) => ({
              ...prev,
              title: e.target.value,
              dirty: true,
            }))
          }
        />
        <textarea
          className="p-4 border-gray-400 border w-full h-96 text-xl"
          placeholder="He kindly stopped for me..."
          value={local.body}
          onChange={(e) =>
            setLocal((prev) => ({ ...prev, body: e.target.value, dirty: true }))
          }
        ></textarea>
        <input
          className="p-4 border-gray-400 border w-full text-xl"
          placeholder="Image?"
          value={local.image}
          onChange={(e) =>
            setLocal((prev) => ({
              ...prev,
              image: e.target.value,
              dirty: true,
            }))
          }
        />
        <button
          className="py-2 px-4 bg-green-700 text-white text-sm rounded-full disabled:opacity-50 transition-opacity"
          onClick={onClickPublish}
          disabled={!local.title || !local.body}
        >
          Publish
        </button>
      </div>
    </div>
  )
}

const HomePostPreviewsContainer = () => {
  const { data } = useQuery<{ posts: Post[] }>(GET_POST_PREVIEWS_QUERY, {
    variables: { filter: 'Home' },
  })
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

const MyPostPreviewsContainer = () => {
  const { data } = useQuery<{ posts: Post[] }>(GET_POST_PREVIEWS_QUERY, {
    variables: { filter: 'Mine' },
  })
  return (
    <div className="flex flex-col gap-4">
      <div className="uppercase">Your Posts</div>
      {data &&
        data.posts.map((post, i) => (
          <div key={post.id}>
            <Link className="text-blue-500" to={`/write/${post.id}`}>
              {post.id}
            </Link>
          </div>
        ))}
    </div>
  )
}

const Home = () => {
  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex">
        <div className="flex-2">
          <HomePostPreviewsContainer />
        </div>
        <div className="flex-1 hidden md:block md:ml-8">
          <div className="flex flex-col gap-4">
            <div className="p-6 rounded-md bg-blue-200">
              <div className="font-light uppercase text-sm">Hey There 👋</div>
              <div className="mt-4">Welcome to my medium clone!</div>
            </div>
            <MyPostPreviewsContainer />
          </div>
        </div>
      </div>
    </div>
  )
}

const Nav = () => (
  <nav className="shadow-md">
    <div className="container mx-auto px-4 sm:px-8 py-4 text-right">
      <span className="font-light">Good morning, Tyler</span>
    </div>
  </nav>
)

ReactDom.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Nav />
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
