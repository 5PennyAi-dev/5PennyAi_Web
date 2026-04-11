import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import ServicesPage from '@/pages/ServicesPage'
import AboutPage from '@/pages/AboutPage'
import Contact from '@/pages/Contact'
import Portfolio from '@/pages/Portfolio'
import Blog from '@/pages/Blog'
import BlogPost from '@/pages/BlogPost'
import AdminBlog from '@/pages/AdminBlog'
import AdminBlogEditor from '@/pages/AdminBlogEditor'
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
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/blog/new" element={<AdminBlogEditor />} />
          <Route path="/admin/blog/edit/:id" element={<AdminBlogEditor />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
