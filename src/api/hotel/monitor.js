import request from '@/utils/request'

export function listCollectionTask(query) {
  return request({
    url: '/hotel/collect/task/list',
    method: 'get',
    params: query
  })
}

export function getCollectionTask(taskId) {
  return request({
    url: `/hotel/collect/task/${taskId}`,
    method: 'get'
  })
}

export function addCollectionTask(data) {
  return request({
    url: '/hotel/collect/task',
    method: 'post',
    data
  })
}

export function updateCollectionTask(data) {
  return request({
    url: '/hotel/collect/task',
    method: 'put',
    data
  })
}

export function delCollectionTask(taskId) {
  return request({
    url: `/hotel/collect/task/${taskId}`,
    method: 'delete'
  })
}

export function crawlCollectionTask(taskId) {
  return request({
    url: `/hotel/collect/task/${taskId}/crawl`,
    method: 'post'
  })
}

export function getCollectionOverview() {
  return request({
    url: '/hotel/collect/task/overview',
    method: 'get'
  })
}

export function listCollectionLocationOptions(params) {
  return request({
    url: '/hotel/collect/task/location-options',
    method: 'get',
    params
  })
}

export function listCollectionSnapshots(taskId) {
  return request({
    url: '/hotel/collect/snapshot/list',
    method: 'get',
    params: { taskId }
  })
}

export function listRoomSnapshots(snapshotId) {
  return request({
    url: `/hotel/collect/snapshot/${snapshotId}/rooms`,
    method: 'get'
  })
}
