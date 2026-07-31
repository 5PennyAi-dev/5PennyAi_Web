import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import AdminBlog from '@/pages/AdminBlog'
import AdminBlogEditor from '@/pages/AdminBlogEditor'
import AdminInfographics from '@/pages/admin/resources/AdminInfographics'
import AdminInfographicForm from '@/pages/admin/resources/AdminInfographicForm'
import { initCal } from '@/lib/cal'

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

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    initCal()
  }, [])

  return (
    <>
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
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
