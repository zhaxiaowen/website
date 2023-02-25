// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: "zhaoxw",
    tagline: "For Freedom",
    url: "http://192.168.50.201",
    baseUrl: "/",
    onBrokenLinks: "log",
    onBrokenMarkdownLinks: "log",
    favicon: "img/favicon.ico",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    // organizationName: 'zhaoxw', // Usually your GitHub org/user name.
    // projectName: 'wiki', // Usually your repo name.

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "zh-Hans",
        locales: ["zh-Hans"],
    },

    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                blog: {
                    blogTitle: "zhaoxw`s Blog",
                    blogDescription: "zhaoxw 的个人生活和工作记录",
                    blogSidebarCount: 7,
                    blogSidebarTitle: "近期文章",
                    showReadingTime: true,

                    feedOptions: {
                        title: "zhaoxw`s Blog",
                        description: "zhaoxw 的个人生活和工作记录",
                        type: 'all',
                        copyright: `Copyright © ${new Date().getFullYear()} zhaoxw, Inc.`,
                    },
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
                sitemap: {
                    changefreq: "weekly",
                    priority: 0.5,
                    filename: 'sitemap.xml',
                },
                googleAnalytics: {
                    trackingID: "G-MHMEL0F832",
                    anonymizeIP: true,
                },
                gtag: {
                    trackingID: 'G-MHMEL0F832',
                    anonymizeIP: true,
                },
            }),
        ],
    ],
    plugins: [

        [
            "@docusaurus/plugin-content-docs",
            {
                id: "interview",
                path: "interview",
                routeBasePath: "interview",
                sidebarPath: require.resolve("./sidebars.js"),

                showLastUpdateAuthor: true,
                showLastUpdateTime: true,
                breadcrumbs: false,
            },
        ],

        [
            "@docusaurus/plugin-content-docs",
            {
                id: "work",
                path: "work",
                routeBasePath: "work",
                sidebarPath: require.resolve("./sidebars.js"),

                showLastUpdateAuthor: true,
                showLastUpdateTime: true,
                breadcrumbs: false,
            },
        ],

        [
            "@docusaurus/plugin-content-docs",
            {
                id: "study_note",
                path: "study_note",
                routeBasePath: "study_note",
                sidebarPath: require.resolve("./sidebars.js"),

                showLastUpdateAuthor: true,
                showLastUpdateTime: true,
                breadcrumbs: false,
            },
        ],

        [
            "@docusaurus/plugin-content-docs",
            {
                id: "scripts",
                path: "scripts",
                routeBasePath: "scripts",
                sidebarPath: require.resolve("./sidebars.js"),

                showLastUpdateAuthor: true,
                showLastUpdateTime: true,
                breadcrumbs: false,
            },
        ],

        [
            "@docusaurus/plugin-content-docs",
            {
                id: "install",
                path: "install",
                routeBasePath: "install",
                sidebarPath: require.resolve("./sidebars.js"),

                showLastUpdateAuthor: true,
                showLastUpdateTime: true,
                breadcrumbs: false,
            },
        ],

        [
            "@docusaurus/plugin-content-docs",
            {
                id: "case",
                path: "case",
                routeBasePath: "case",
                sidebarPath: require.resolve("./sidebars.js"),

                showLastUpdateAuthor: true,
                showLastUpdateTime: true,
                breadcrumbs: false,
            },
        ],
// -----------------------------------------------------------------------------------
    ],
    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            // announcementBar: {
            //   id: 'support_us',
            //   content:
            //     'Always For Freedom. The site by zhaoxw.',
            //   backgroundColor: '#fafbfc',
            //   textColor: '#091E42',
            //   isCloseable: false,
            // },
            metadata: [
                {
                    name: "keywords",
                    content: "zhaoxw, wiki, blog,k8s, python, linux",
                },
            ],
            navbar: {
                title: "📚 zhaoxw's Wiki",
                hideOnScroll: true,
                // logo: {
                //   alt: 'Site Logo',
                //   src: 'img/logo.svg',
                //   srcDark: 'img/logo_dark.svg',
                //   href: 'https://docusaurus.io/',
                //   target: '_self',
                //   width: 32,
                //   height: 32,
                // },
                items: [
                    {to: "/study_note", label: "️📚 学习笔记", position: "right"},
                    { to: "/work", label: "💼 工作", position: "right" },
                    {to: "/interview", label: "👨‍💻 面试", position: "right"},
                    {to: "/install", label: "🚴🏻‍♀️ 部署", position: "right"},
                    {to: "/scripts", label: "👨🏻‍🌾️ 脚本", position: "right"},
                    {to: "/case", label: "💻 现网案例", position: "right"},
                    // { to: "/other", label: "📽️ 其他", position: "right" },
                ],
            },
            algolia: {
                apiKey: "5d5a02bdf02df700355c8ccd84b78d13",
                appId: "8W3YJXJGF2",
                indexName: "wiki",
            },
            footer: {
                style: "dark",
                copyright: `Copyright © ${new Date().getFullYear()} zhaoxw, Inc. Built with <a href="https://www.docusaurus.cn/" target="_blank" rel="noopener noreferrer">Docusaurus</a>.<br>Powered by <a href="https://webify.cloudbase.net/" target="_blank" rel="noopener noreferrer">CloudBase Webify</a>`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
                defaultLanguage: "markdown",
                additionalLanguages: ["git", "nginx", "http"],
            },
        }),
};

module.exports = config;


