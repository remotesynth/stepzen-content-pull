module.exports = {
  account_name: 'biggs',
  endpoint: '/netlify/pets-blog',
  queries: [
    {
      query: `{
            getPosts {
              title
              body
              published
              id
              categories {
                name
              }
            }
          }`,
      convert_to: '.md',
      slug_field: 'title',
      body_field: 'body',
      folder: '_posts',
      additional_frontmatter: {
        layout: 'post',
      },
    },
    {
      query: `{
            getPostByID(id: "44") {
              title
              published
              categories {
                name
              }
              id
              body
            }
          }`,
      convert_to: '.md',
      slug_field: 'title',
      body_field: 'body',
      folder: '',
      additional_frontmatter: {
        layout: 'page',
      },
    },
    {
      query: `{
            getCategories {
              name
              id
            }
          }`,
      convert_to: 'categories.yaml',
      folder: 'data',
    },
  ],
};
