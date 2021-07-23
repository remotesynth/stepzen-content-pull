module.exports = {
  account_name: 'hollister',
  endpoint: '/vercel/stepzen',
  queries: [
    {
      query: `{
              products(first:10) {
                edges {
                  node {
                    title
                    description
                    publishedAt
                    bodyHtml
                  }
                }
              }
            }`,
      root_node: 'edges[].node',
      convert_to: '.md',
      slug_field: 'title',
      body_field: 'bodyHtml',
      folder: 'content/products',
      additional_frontmatter: {
        layout: 'product',
      },
    },
  ],
};
