/ @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.hexakode.in',
  generateRobotsTxt: true,

  sitemapSize: 5000,

  changefreq: 'weekly',
  priority: 0.7,

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },

  exclude: [
    '/admin',
    '/admin/',
    '/api/*',
    '/404',
    '/500',
  ],
}