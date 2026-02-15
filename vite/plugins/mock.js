export default function mockPlugin() {
  return {
    name: 'mock-server',
    configureServer(server) {
      server.middlewares.use('/dev-api/auth/login', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          code: 200,
          msg: 'success',
          data: {
            access_token: 'mock-token-123456',
            token_type: 'Bearer',
            expire_in: 3600
          }
        }))
      })
      
      server.middlewares.use('/dev-api/system/user/getInfo', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          code: 200,
          msg: 'success',
          user: {
            userId: 1,
            userName: 'admin',
            nickName: '管理员',
            avatar: '',
            email: 'admin@example.com',
            phonenumber: '13800138000',
            sex: '1',
            status: '0',
            createTime: '2024-01-01 00:00:00'
          },
          roles: ['admin'],
          permissions: ['*:*:*'],
          isDefaultModifyPwd: false,
          isPasswordExpired: false
        }))
      })
      
      server.middlewares.use('/dev-api/code', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          code: 200,
          msg: 'success',
          img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          uuid: 'mock-uuid-1234'
        }))
      })
    }
  }
}
