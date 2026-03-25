import request from '@/utils/request'

export function searchPublicMusic(keyword) {
  return request({
    url: '/system/music/search',
    method: 'get',
    params: { keyword }
  })
}

export function buildMusicAudioUrl(url, name, download = false) {
  const params = new URLSearchParams()
  params.set('url', url)
  params.set('name', name || 'music-preview')
  params.set('download', String(download))
  return `${import.meta.env.VITE_APP_BASE_API || '/dev-api'}/system/music/audio?${params.toString()}`
}
