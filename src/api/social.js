import request from '@/utils/request'

export function getSocialLanding() {
  return request({
    url: '/system/social/public/landing',
    method: 'get'
  })
}

export function getSocialAdminOverview() {
  return request({
    url: '/system/social/admin/overview',
    method: 'get'
  })
}

export function getSocialPublicProfiles() {
  return request({
    url: '/system/social/public/profiles',
    method: 'get'
  })
}
