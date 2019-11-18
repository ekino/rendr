const xml = require("xml2json")
const Axios = require("axios")
const parseUrl = require("url-parse")
const path = require("path")

const { createApiLoader, createChainedLoader } = require("@ekino/rendr-loader")
const { createContext, Page } = require("@ekino/rendr-core")

// load the datasource of the urls, we need to get the list
// of all url availables. So we can call the url json api to get
// the content.
async function loadSitemap(url) {
  const response = await Axios.get(url, {
    responseType: "text",
  })

  return xml.toJson(response.data, {
    object: true,
  }).urlset.url
}

exports.createPagesStatefully = async ({ actions, reporter }) => {
  const { createPage } = actions
  const rendrTemplate = path.resolve(`src/_rendr.js`)

  let remoteApi = "http://localhost:3000/api"

  if (process.env.REMOTE_API) {
    remoteApi = process.env.REMOTE_API
  }

  reporter.info("★ rendr > Loading sitemap")
  const pageReferences = await loadSitemap(`${remoteApi}/sitemap.xml`)

  const loader = createChainedLoader([createApiLoader(remoteApi)])

  reporter.info("★ rendr > Loading page definitions")

  for (const i in pageReferences) {
    const url = parseUrl(pageReferences[i].loc)

    try {
      const ctx = createContext({ url: url.pathname + url.query })
      const page = await loader(ctx, new Page(), () => null)

      createPage({
        path: url.pathname,
        component: rendrTemplate,
        context: {
          page,
        },
      })
    } catch (err) {
      console.log(err)
    }
  }

  reporter.info("★ rendr > end creating page information")
}
