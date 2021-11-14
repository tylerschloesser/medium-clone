import cors from 'cors'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import {
  extendType,
  list,
  makeSchema,
  mutationType,
  objectType,
  queryType,
  stringArg,
} from 'nexus'
import { nanoid } from 'nanoid'

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.id('id')
    t.string('title')
    t.string('body')
    t.string('author')
    t.string('image')
  },
})

interface Post {
  id: string
  title: string
  body: string
  author?: string
  image?: string
}

const db: Record<string, Post> = {}

// https://source.unsplash.com/random/200x150
const TEST_POSTS = [
  {
    title: 'The quick brow fox',
    author: 'Tyler Schloesser',
    image:
      'https://images.unsplash.com/photo-1634534904807-b676da34dc79?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=150&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTYzNjgyNTAyOA&ixlib=rb-1.2.1&q=80&w=200',
  },
  {
    title: 'My Struggle',
    author: 'Bill Clinton',
    image:
      'https://images.unsplash.com/photo-1636654286371-a2496896eb6d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=150&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTYzNjgyNTA2Nw&ixlib=rb-1.2.1&q=80&w=200',
  },
].map((p, i) => ({ id: `test-${i}`, ...p }))

const Query = queryType({
  definition(t) {
    t.string('hello', {
      args: { name: stringArg() },
      resolve: (_parent, { name }) => `Hello ${name || 'World'}!`,
    })
    t.field('posts', {
      type: list(Post),
      resolve: () => TEST_POSTS,
    })
  },
})

const PostMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('update', {
      type: 'Post',
      args: {
        id: stringArg(),
        title: stringArg(),
        body: stringArg(),
      },
      resolve(_root, args) {
        let post = args
        if (!args.id) {
          post.id = nanoid()
        }
        db[post.id] = post
        return post
      },
    })
  },
})

const schema = makeSchema({
  types: [Query, PostMutation],
  outputs: {
    schema: __dirname + '/generated/schema.graphql',
    typegen: __dirname + '/generated/typings.ts',
  },
})

const app = express()
app.use(cors())
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
)
app.listen(4000, () => {
  console.log('graphql server listening')
})
