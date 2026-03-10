import { MDXRemote } from "next-mdx-remote/rsc"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import remarkGfm from "remark-gfm"
import { mdxComponents } from "@/components/mdx"

export function MDXContent({ raw }: { raw: string }) {
  return (
    <MDXRemote
      source={raw}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            [rehypePrettyCode, { theme: "github-dark" }],
          ],
        },
      }}
    />
  )
}
