import router from './router'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import useUserStore from '@/store/modules/user'
import usePermissionStore from '@/store/modules/permission'

const whiteList = ['/', '/login', '/register']

router.beforeEach(async (to, from, next) => {
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/index' })
      return
    }

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const hasRoles = userStore.roles && userStore.roles.length > 0

    if (hasRoles) {
      next()
      return
    }

    try {
      await userStore.getInfo()
      const accessRoutes = await permissionStore.generateRoutes()
      accessRoutes.forEach(route => {
        if (!isHttp(route.path)) {
          router.addRoute(route)
        }
      })
      next({ ...to, replace: true })
    } catch (error) {
      await userStore.resetToken()
      ElMessage.error(error?.message || '登录状态失效，请重新登录')
      next(`/login?redirect=${to.path}`)
    }
    return
  }

  if (whiteList.includes(to.path)) {
    next()
  } else {
    next(`/login?redirect=${to.fullPath}`)
  }
})
