# StepZen Content Pull for Jamstack Sites

```bash
npx @remotesynth/stepzen-content-pull
```

This project is aimed at making it easier to pull content from any source hooked into your [StepZen GraphQL API](https://stepzen.com) and convert that into file-based resources that can be processed at build time in any static site generator. While this can work with any SSG, it is especially useful for ones that do not have a built-in means to call an API directly during the build.

This can be combined with the [StepZen Netlify Build Plugin](https://stepzen.com/docs/connecting-frontends/netlify-build-plugin) to create a build workflow that automatically pulls new content from the API whenever a build is process. (See [this tutorial](https://www.netlify.com/blog/2021/06/10/how-to-build-a-database-driven-jamstack-site/) on Netlify's blog for a general idea of how this workflow could be set up).

## Configuration

This library requires two things to function:

1. A `.env` file containing your `STEPZEN_API_KEY` or your API key passed via the `--apikey` flag. Your API key can be found on your [StepZen account page](https://stepzen.com/account). Note, it does not require the Admin Key, just the standard API Key.
2. A `config.js` file laying out the queries from which content will be generated. You can see an example file in `example.config.js`. More details on this file are below.

### config.js

The `config.js` file is loaded in at runtime as a module. The module must export a JavaScript object with the following properties:

* `account_name` - This is your StepZen account name that can be found on your [StepZen account page](https://stepzen.com/account).
* `endpoint` - This is the folder name and endpoint name that you supplied when deploying your API to StepZen (for example, using `stepzen start`). It should be in the format `folder_name/endpoint_name`. This, combined with the `account_name` will determine the endpoint URL. For example, if my account name is `brian` and the `endpoint` is `api/foobar`, then all the queries will be run against `https://brian.stepzen.net/api/foobar/__graphql`.
* `queries` - This is an array of all of the queries that you would like to be converted to file-based content. There are different properties that need to be passed depending on the type of files you'd like the resulting data to be converted to.

### `queries` Configuration

There are four types of files that can be converted. The configuration for the `queries` array can differ somewhat for each. However, the following values are required for every type:

* `query` - This is the GraphQL query that will be sent to the endpoint.
* `convert_to` - This is the file name or file type you want to convert the data to. For single files like JSON/YAML data files, you would like the full file name (i.e. `mydata.json` or `mydata.yaml`). This also applies to single Markdown files (i.e. `about.md` or `about.markdown`) that you do not want to generate a slug for. For an array of items to be converted to Markdown, you only need to supply the file extension (i.e. `.md` or `.markdown`). The tool does not yet support looping through a result and writing unique data files. For YAML or JSON, the full results are converted and written as a single data file.
* `folder` - This is the relative path to the folder within your project that the file should be written to. For example, a value of `_posts` will write the `/_posts` folder within your project. An empty value will write the files to the root directory of your project.
* `root_node` - Some queries don't return the data you want to convert in the root of the query result. You can use `root_node` to flatten the results to properly convert to JSON, YAML or Markdown that you need. For example, a query may return items under an `edges` array and then each result under a `node` object within each array item. You can specify `root_node: 'edges[].node` in order to flatten the object in a way that will properly convert each item into Markdown.

#### 1. Converting to JSON

The query response can be written directly to a JSON file. There are no additional fields required for writing to JSON.

#### 2. Converting to YAML

The query response can be converted to YAML using [js-yaml](https://www.npmjs.com/package/js-yaml). There are no additional fields required for writing to YAML.

#### 3. Converting to a single Markdown file

The result of the query should be a single item, not an array of items. The following fields are also available:

* `slug_field` (optional) - This is a field in the query that you would like converted to a slug (ex. "About Us" to `about-us.md`). If this field is not present, the value of `convert_to` should be the full file name. If this value is included, the value of `convert_to` should be either `.md` or `.markdown`.
* `body_field` (required) - This is the field that will populate the body of the Markdown file. Every other field returned by the query will be converted to YAML and placed within the frontmatter.
* `additional_frontmatter` (optional) - This is a JavaScript object representing additional fields that will be written as YAML in each files frontmatter. In some cases, you'll want to add additional frontmatter fields to every result returned by the query. For example, some SSGs require that you specify a `layout` value, so you might have `layout: 'page'` as part of this object.

#### 4. Converting to a multiple Markdown files

The result of the query should be an array of items. The following fields are also available:

* `slug_field` (required) - This is a field in the query that you would like converted to a slug (ex. "My First Post" to `my-first-post.md`). This is required for multiple Markdown files as each item is generated with a unique file name. The value of `convert_to` should be either `.md` or `.markdown`.
* `body_field` (required) - This is the field that will populate the body of each Markdown file. Every other field returned by the query will be converted to YAML and placed within the frontmatter.
* `additional_frontmatter` (optional) - This is a JavaScript object representing additional fields that will be written as YAML in each files frontmatter. In some cases, you'll want to add additional frontmatter fields to every result returned by the query. For example, some SSGs require that you specify a `layout` value, so you might have `layout: 'post'` as part of this object.

## Running the Script

You can run the content pull via:

```bash
npx @remotesynth/stepzen-content-pull
```

You'll need to have a `config.js` in the folder you are running in as well as a `.env` with your `STEPZEN_API_KEY`. Alternatively, you can specify a different config using the `--config` flag. For example:

```bash
npx @remotesynth/stepzen-content-pull --config "configs/content-pull-confg.js"
```

Or you can pass an API key via the `--apikey` flag.

```bash
npx @remotesynth/stepzen-content-pull --apikey "my-api-key"
```