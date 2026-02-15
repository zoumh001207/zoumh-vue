import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

const usePermissionStore = defineStore(
  'permission',
  {
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
      setTopbarRoutes(routes) {
        this.topbarRouters = routes
      },
      setSidebarRouters(routes) {
        this.sidebarRouters = routes
      },
      generateRoutes(roles) {
        return new Promise((resolve, reject) => {
          // 向后端请求路由数据
          getRouters().then(res => {
            // 检查返回数据
            console.log('后端返回的菜单数据:', res)
            console.log('菜单数据类型:', typeof res.data, Array.isArray(res.data))
            
            // 验证数据格式
            if (!res.data) {
              console.warn('后端返回的菜单数据为空')
              ElMessage.warning('未获取到菜单数据，请检查后端菜单配置')
              // 使用空路由
              this.setRoutes([])
              this.setSidebarRouters(constantRoutes)
              this.setDefaultRoutes([])
              this.setTopbarRoutes([])
              resolve([])
              return
            }
            
            // 确保数据是数组
            const menuData = Array.isArray(res.data) ? res.data : []
            if (menuData.length === 0) {
              console.warn('后端返回的菜单数据为空数组')
              ElMessage.warning('菜单数据为空，请检查后端菜单配置或用户权限')
            }
            
            const sdata = JSON.parse(JSON.stringify(menuData))
            const rdata = JSON.parse(JSON.stringify(menuData))
            const defaultData = JSON.parse(JSON.stringify(menuData))
            const sidebarRoutes = filterAsyncRouter(sdata)
            const rewriteRoutes = filterAsyncRouter(rdata, false, true)
            const defaultRoutes = filterAsyncRouter(defaultData)
            const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
            asyncRoutes.forEach(route => { router.addRoute(route) })
            this.setRoutes(rewriteRoutes)
            this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
            this.setDefaultRoutes(sidebarRoutes)
            this.setTopbarRoutes(defaultRoutes)
            
            console.log('处理后的路由数量:', {
              sidebarRoutes: sidebarRoutes.length,
              rewriteRoutes: rewriteRoutes.length,
              defaultRoutes: defaultRoutes.length
            })
            
            resolve(rewriteRoutes)
          }).catch(error => {
            // 捕获错误，避免未处理的 Promise 拒绝
            console.error('获取路由失败:', error)
            // 使用空路由，避免页面崩溃
            this.setRoutes([])
            this.setSidebarRouters(constantRoutes)
            this.setDefaultRoutes([])
            this.setTopbarRoutes([])
            // 仍然 reject，让调用方知道获取路由失败
            reject(error)
          })
        })
      }
    }
  })

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach(el => {
    el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path
    if (el.children && el.children.length && el.component === 'ParentView') {
      children = children.concat(filterChildren(el.children, el))
    } else {
      children.push(el)
    }
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view) => {
  let res
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0]
    if (dir === view) {
      res = () => modules[path]()
    }
  }
  return res
}

export default usePermissionStore
