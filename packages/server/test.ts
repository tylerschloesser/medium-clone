import cors from 'cors'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import {
  enumType,
  extendType,
  list,
  makeSchema,
  mutationType,
  nonNull,
  objectType,
  queryType,
  stringArg,
} from 'nexus'
import { nanoid } from 'nanoid'
import { promises as fs } from 'fs'
import { PrismaClient } from '@prisma/client'

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

const db = {
  async put(post: Post): Promise<Post> {
    const current = JSON.parse(
      await fs.readFile('db.json', { encoding: 'utf8' }),
    )
    await fs.writeFile(
      'db.json',
      JSON.stringify({ ...current, [post.id]: post }, null, 2),
      { encoding: 'utf8' },
    )
    return post
  },
  async get(id: string): Promise<Post | null> {
    const current = JSON.parse(
      await fs.readFile('db.json', { encoding: 'utf8' }),
    )
    console.log(current, id, current[id])
    return current[id] ?? null
  },
  async query(): Promise<Post[]> {
    const current = <Record<string, Post>>(
      JSON.parse(await fs.readFile('db.json', { encoding: 'utf8' }))
    )
    return Object.values(current)
  },
}

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

const PostFilter = enumType({
  name: 'PostFilter',
  members: ['Home', 'Mine'],
})

const Query = queryType({
  definition(t) {
    t.string('hello', {
      args: { name: stringArg() },
      resolve: (_parent, { name }) => `Hello ${name || 'World'}!`,
    })
    t.field('posts', {
      type: list(Post),
      args: { filter: PostFilter },
      resolve: (_parent, { filter }) => {
        if (filter === 'Home') {
          return TEST_POSTS
        }
        if (filter === 'Mine') {
          return db.query()
        }
        throw Error(`Invalid filter: ${filter}`)
      },
    })
    t.field('post', {
      type: Post,
      args: { id: nonNull(stringArg()) },
      resolve: async (_parent, args) => {
        const post = await db.get(args.id!)
        if (!post) {
          throw Error(`Invalid post ID: ${args.id}`)
        }
        return post
      },
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
        title: nonNull(stringArg()),
        body: nonNull(stringArg()),
      },
      async resolve(_root, args) {
        let post = args
        if (!post.id) {
          post.id = nanoid()
        } else if (!(await db.get(post.id))) {
          throw Error(`Invalid post ID: ${post.id}`)
        }
        db.put(<Post>post)
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
