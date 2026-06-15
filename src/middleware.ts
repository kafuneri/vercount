import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 获取请求来源的域名 (Origin 或 Referer)
  const origin = request.headers.get('origin') || request.headers.get('referer') || ''

  // 👇 在这里填入您允许的域名白名单
  const allowedDomains = [
    'kafuchino.top', 
    'localhost' // 建议保留 localhost 方便本地调试
  ]

  // 判断来源是否在白名单中
  const isAllowed = allowedDomains.some(domain => origin.includes(domain))

  // 如果请求存在来源域名，且不在白名单内，直接返回 403 拒绝访问
  if (origin && !isAllowed) {
    return new NextResponse('Forbidden: Unauthorized Domain', { status: 403 })
  }

  // 允许放行
  return NextResponse.next()
}

// 仅对计数接口生效，不影响后台登录和页面访问
export const config = {
  matcher: '/api/v2/log',
}
