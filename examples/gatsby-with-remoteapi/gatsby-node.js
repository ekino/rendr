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

exports.createPages = async ({ actions }) => {
  const { createPage } = actions
  const rendrTemplate = path.resolve(`src/_rendr.js`)

  const pageReferences = await loadSitemap(
    "https://nextjs-with-remoteapi.rande.now.sh/sitemap.xml"
  )

  const loader = createChainedLoader([
    createApiLoader("https://nextjs-with-remoteapi.rande.now.sh/api"),
  ])

  for (const i in pageReferences) {
    const url = parseUrl(pageReferences[i].loc)

    try {
      const ctx = createContext({ url: url.pathname })
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
}
