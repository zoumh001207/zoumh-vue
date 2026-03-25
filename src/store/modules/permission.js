import { constantRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'

const modules = import.meta.glob('../../views/**/*.vue')

function shouldRemoveRoute(route) {
  const path = String(route?.path || '').toLowerCase()
  const name = String(route?.name || '').toLowerCase()
  const title = String(route?.meta?.title || '').toLowerCase()

  const byTitle = ['sentinel', 'nacos', '系统接口']
    .some(key => title.includes(String(key).toLowerCase()))
  const byName = ['sentinel', 'nacos'].some(key => name.includes(key))
  const byPath = [
    'nacos',
    'sentinel',
    'doc.html',
    'swagger-ui',
    '/v3/api-docs'
  ].some(key => path.includes(key))

  return byTitle || byName || byPath
}

function loadView(view) {
  return modules[`../../views/${view}.vue`] || modules[`/src/views/${view}.vue`]
}

function normalizeComponent(component, hasChildren) {
  if (!component) {
    return hasChildren ? ParentView : null
  }
  if (component === 'Layout') {
    return Layout
  }
  if (component === 'ParentView') {
    return ParentView
  }
  if (component === 'InnerLink') {
    return InnerLink
  }
  const resolved = loadView(component)
  if (resolved) {
    return resolved
  }
  return hasChildren ? ParentView : null
}

function transformRoutes(routes) {
  return routes.map(route => {
    const current = { ...route }
    if (shouldRemoveRoute(current)) {
      return null
    }

    if (current.children && current.children.length > 0) {
      current.children = transformRoutes(current.children)
    }

    const hasChildren = Array.isArray(current.children) && current.children.length > 0
    current.component = normalizeComponent(current.component, hasChildren)

    if (!current.component && !hasChildren) {
      return null
    }
    return current
  }).filter(Boolean)
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: []
  }),
  actions: {
    setRoutes(routes) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },
    setDefaultRoutes(routes) {
      this.defaultRoutes = constantRoutes.concat(routes)
    },
    setTopbarRouters(routes) {
      this.topbarRouters = routes
    },
    setSidebarRouters(routes) {
      this.sidebarRouters = constantRoutes.concat(routes)
    },
    async generateRoutes() {
      const routerResponse = await getRouters()
      const rawRoutes = Array.isArray(routerResponse) ? routerResponse : (routerResponse?.data || [])
      const accessedRoutes = transformRoutes(rawRoutes)
      this.setRoutes(accessedRoutes)
      this.setDefaultRoutes(accessedRoutes)
      this.setTopbarRouters(accessedRoutes)
      this.setSidebarRouters(accessedRoutes)
      return accessedRoutes
    }
  }
})

export default usePermissionStore
