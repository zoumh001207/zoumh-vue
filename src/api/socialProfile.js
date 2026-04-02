import request from '@/utils/request'

export function listSocialProfile(query) {
  return request({
    url: '/system/social/profile/list',
    method: 'get',
    params: query
  })
}

export function getSocialProfile(profileId) {
  return request({
    url: `/system/social/profile/${profileId}`,
    method: 'get'
  })
}

export function addSocialProfile(data) {
  return request({
    url: '/system/social/profile',
    method: 'post',
    data
  })
}

export function updateSocialProfile(data) {
  return request({
    url: '/system/social/profile',
    method: 'put',
    data
  })
}

export function delSocialProfile(profileId) {
  return request({
    url: `/system/social/profile/${profileId}`,
    method: 'delete'
  })
}
