// @ts-nocheck — contentlayer uses vfile v5, rehype-pretty-code uses v6; type-incompatible but runtime-compatible
import { defineDocumentType, makeSource } from "contentlayer/source-files"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import readingTime from "reading-time"

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: "blog/**/*.mdx",
  contentType: "mdx",
  fields: {
    title:       { type: "string",  required: true },
    description: { type: "string",  required: true },
    publishedAt: { type: "date",    required: true },
    updatedAt:   { type: "date" },
    author:      { type: "string",  required: true, default: "retainr team" },
    tags:        { type: "list", of: { type: "string" }, default: [] },
    image:       { type: "string" },
    featured:    { type: "boolean", default: false },
    draft:       { type: "boolean", default: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^blog\//, ""),
    },
    url: {
      type: "string",
      resolve: (doc) => `/blog/${doc._raw.flattenedPath.replace(/^blog\//, "")}`,
    },
    readingTime: {
      type: "string",
      resolve: (doc) => readingTime(doc.body.raw).text,
    },
  },
}))

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [Post],
  disableImportAliasWarning: true,
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, { theme: "github-dark" }],
    ],
  },
})
