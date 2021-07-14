const https = require('https');
const slugify = require('slugify');
const yaml = require('js-yaml');
const { writeFile, writeMarkdown } = require('./file-utils');

exports.runQueries = function (config, apiKey) {
  if (!apiKey || apiKey === '')
    throw new Error('Please provide a STEPZEN_API_KEY');
  // set up the API connection, you'll need a .env with a STEPZEN_API_KEY
  const options = {
    hostname: `${config.account_name}.stepzen.net`,
    path: `${config.endpoint}/__graphql`,
    port: 443,
    method: 'POST',
    'Content-Length': config.queries[0].query.length,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Apikey ' + apiKey,
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
        if (!results.data)
          throw new Error('The query did not return any results');
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
          writeFile(destination, JSON.stringify(theData));
        } else if (fileType === 'yaml') {
          let destination = `./${query.folder}/${query.convert_to}`;
          // if folder was empty remove the double slash
          destination = destination.replaceAll('//', '/');
          let yamlStr = yaml.dump(theData);
          writeFile(destination, yamlStr);
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
            writeMarkdown(destination, frontmatter, body);
          }
        }
      });
    });
    req.write(JSON.stringify({ query: query.query }));
    req.end();
  });
};
