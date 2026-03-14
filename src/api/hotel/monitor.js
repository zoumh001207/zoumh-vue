import request from '@/utils/request'

export function listHotelMonitor(query) {
  return request({
    url: '/hotel/monitor/list',
    method: 'get',
    params: query
  })
}

export function getHotelMonitor(monitorId) {
  return request({
    url: `/hotel/monitor/${monitorId}`,
    method: 'get'
  })
}

export function addHotelMonitor(data) {
  return request({
    url: '/hotel/monitor',
    method: 'post',
    data
  })
}

export function updateHotelMonitor(data) {
  return request({
    url: '/hotel/monitor',
    method: 'put',
    data
  })
}

export function delHotelMonitor(monitorId) {
  return request({
    url: `/hotel/monitor/${monitorId}`,
    method: 'delete'
  })
}

export function getHotelMonitorOverview() {
  return request({
    url: '/hotel/monitor/overview',
    method: 'get'
  })
}

export function getHotelMonitorHistory(monitorId) {
  return request({
    url: `/hotel/monitor/${monitorId}/history`,
    method: 'get'
  })
}

export function crawlHotelMonitor(monitorId) {
  return request({
    url: `/hotel/monitor/${monitorId}/crawl`,
    method: 'post'
  })
}
