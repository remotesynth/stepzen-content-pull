const https = require('https');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const yaml = require('js-yaml');
require('dotenv').config();

// define the queries and details on how to convert them
const config = {
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

// set up the API connection, you'll need a .env with a STEPZEN_API_KEY
const options = {
  hostname: `${config.account_name}.stepzen.net`,
  path: `${config.endpoint}/__graphql`,
  port: 443,
  method: 'POST',
  'Content-Length': config.queries[0].query.length,
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Apikey ' + process.env.STEPZEN_API_KEY,
    'User-Agent': 'Node',
  },
};

config.queries.map((query) => {
  let req = https.request(options, (res) => {
    let data = '';

    res.on('data', (d) => {
      data += d;
    });
    req.on('error', (error) => {
      console.error(error);
    });
    res.on('end', () => {
      const results = JSON.parse(data);
      // get the query keys from the results
      // currently, it is assumed that there is only one key per result
      const keys = Object.keys(results.data);
      const theData = results.data[keys[0]];
      // currently supported file types are yaml, json, md and markdown
      const fileType = query.convert_to.split('.')[1];
      if (fileType === 'json') {
        // for json, just write the results as is
        let destination = `./${query.folder}/${query.convert_to}`;
        // if folder was empty remove the double slash
        destination = destination.replaceAll('//', '/');
        // make the directory if it doesn't exist
        makeDirectory(destination);
        fs.writeFileSync(destination, JSON.stringify(theData));
      } else if (fileType === 'yaml') {
        let destination = `./${query.folder}/${query.convert_to}`;
        // if folder was empty remove the double slash
        destination = destination.replaceAll('//', '/');
        let yamlStr = yaml.dump(theData);
        // make the directory if it doesn't exist
        makeDirectory(destination);
        fs.writeFileSync(destination, yamlStr);
      } else if (fileType === 'md' || fileType === 'markdown') {
        // generate a markdown page for every item in the array
        if (Array.isArray(theData)) {
          theData.map((page) => {
            let body = page[query.body_field];
            let slug = slugify(page[query.slug_field]);
            let destination = `./${query.folder}/${slug}${query.convert_to}`;
            // if folder was empty remove the double slash
            destination = destination.replaceAll('//', '/');
            let frontmatter = Object.assign({}, page);
            if (query.additional_frontmatter) {
              frontmatter = Object.assign(
                frontmatter,
                query.additional_frontmatter
              );
            }
            delete frontmatter[query.body_field];
            // make the directory if it doesn't exist
            makeDirectory(destination);
            writeMarkdown(destination, frontmatter, body);
          });
        } else {
          let body = theData[query.body_field];
          // if I supplied a slug field, generate the filename
          // otherwise use the specified filename
          let slug = query.convert_to;
          if (query.slug_field)
            slug = slugify(theData[query.slug_field]) + query.convert_to;
          let destination = `./${query.folder}/${slug}`;
          // if folder was empty remove the double slash
          destination = destination.replaceAll('//', '/');
          let frontmatter = Object.assign({}, theData);
          if (query.additional_frontmatter) {
            frontmatter = Object.assign(
              frontmatter,
              query.additional_frontmatter
            );
          }
          delete frontmatter[query.body_field];
          // make the directory if it doesn't exist
          makeDirectory(destination);
          writeMarkdown(destination, frontmatter, body);
        }
      }
    });
  });
  req.write(JSON.stringify({ query: query.query }));
  req.end();
});

function writeMarkdown(destination, frontmatter, body) {
  const lines = [
    '---',
    yaml.dump(frontmatter).trim(),
    '---',
    body ? body.toString().trim() : '',
    '',
  ];
  const content = lines.join('\n');
  fs.writeFileSync(destination, content);
}

function makeDirectory(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  fs.mkdirSync(dirname, { recursive: true });
}
