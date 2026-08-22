import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Analytics } from '@vercel/analytics/react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import AboutPage from '@/pages/AboutPage'
import Contact from '@/pages/Contact'
import Portfolio from '@/pages/Portfolio'
import PortfolioIndex from '@/pages/PortfolioIndex'
import BlogComingSoon from '@/pages/BlogComingSoon'
import ResourcesAI from '@/pages/ResourcesAI'
import ResourceSeriesDetail from '@/pages/ResourceSeriesDetail'
import InfographicDetail from '@/pages/InfographicDetail'
import ArticleDetail from '@/pages/ArticleDetail'
import PromptDetail from '@/pages/PromptDetail'
import AdminBlog from '@/pages/AdminBlog'
import AdminBlogEditor from '@/pages/AdminBlogEditor'
import AdminInfographics from '@/pages/admin/resources/AdminInfographics'
import AdminInfographicForm from '@/pages/admin/resources/AdminInfographicForm'
import AdminArticles from '@/pages/admin/resources/AdminArticles'
import AdminArticleForm from '@/pages/admin/resources/AdminArticleForm'
import AdminPrompts from '@/pages/admin/resources/AdminPrompts'
import AdminPromptForm from '@/pages/admin/resources/AdminPromptForm'
import AdminSeries from '@/pages/admin/resources/AdminSeries'
import AdminSeriesForm from '@/pages/admin/resources/AdminSeriesForm'
import AdminTopics from '@/pages/admin/resources/AdminTopics'
import AdminTopicForm from '@/pages/admin/resources/AdminTopicForm'
import { initCal } from '@/lib/cal'
import { filterAnalyticsEvent } from '@/lib/analytics'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Only auto-scroll to top when there's no hash (anchor)
    if (!hash) {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}

function App() {
  const { i18n } = useTranslation()
  const { pathname } = useLocation()

  useEffect(() => {
    if (
      !pathname.startsWith('/ressources-ia/articles/') &&
      !pathname.startsWith('/ressources-ia/prompts/')
    ) {
      document.documentElement.lang = i18n.language
    }
  }, [i18n.language, pathname])

  useEffect(() => {
    initCal()
  }, [])

  return (
    <>
      <Analytics beforeSend={filterAnalyticsEvent} />
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expertise" element={<Navigate to="/about" replace />} />
          <Route path="/services" element={<Navigate to="/about" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/portfolio" element={<PortfolioIndex />} />
          <Route path="/portfolio/pennyseo" element={<Portfolio />} />
          <Route path="/portfolio/pipeline-editorial" element={<Navigate to="/portfolio" replace />} />
          <Route path="/blog" element={<BlogComingSoon />} />
          <Route path="/blog/:slug" element={<Navigate to="/blog" replace />} />
          <Route path="/ressources-ia" element={<ResourcesAI />} />
          <Route path="/ressources-ia/series/:seriesSlug" element={<ResourceSeriesDetail />} />
          <Route path="/ressources-ia/infographies/:id" element={<InfographicDetail />} />
          <Route path="/ressources-ia/articles/:slug" element={<ArticleDetail />} />
          <Route path="/ressources-ia/prompts/:slug" element={<PromptDetail />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/blog/topics" element={<AdminBlog />} />
          <Route path="/admin/blog/new" element={<AdminBlogEditor />} />
          <Route path="/admin/blog/edit/:id" element={<AdminBlogEditor />} />
          <Route
            path="/admin/ressources-ia/infographies"
            element={<AdminInfographics />}
          />
          <Route
            path="/admin/ressources-ia/infographies/nouvelle"
            element={<AdminInfographicForm />}
          />
          <Route
            path="/admin/ressources-ia/infographies/:id/modifier"
            element={<AdminInfographicForm />}
          />
          <Route
            path="/admin/ressources-ia/articles"
            element={<AdminArticles />}
          />
          <Route
            path="/admin/ressources-ia/articles/nouvel"
            element={<AdminArticleForm />}
          />
          <Route
            path="/admin/ressources-ia/articles/:id/modifier"
            element={<AdminArticleForm />}
          />
          <Route
            path="/admin/ressources-ia/prompts"
            element={<AdminPrompts />}
          />
          <Route
            path="/admin/ressources-ia/prompts/nouveau"
            element={<AdminPromptForm />}
          />
          <Route
            path="/admin/ressources-ia/prompts/:id/modifier"
            element={<AdminPromptForm />}
          />
          <Route
            path="/admin/ressources-ia/series"
            element={<AdminSeries />}
          />
          <Route
            path="/admin/ressources-ia/series/nouvelle"
            element={<AdminSeriesForm />}
          />
          <Route
            path="/admin/ressources-ia/series/:id"
            element={<AdminSeriesForm />}
          />
          <Route path="/admin/ressources-ia/sujets" element={<AdminTopics />} />
          <Route path="/admin/ressources-ia/sujets/nouveau" element={<AdminTopicForm />} />
          <Route path="/admin/ressources-ia/sujets/:id" element={<AdminTopicForm />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
