export function mockWechatLoginEnabled(): boolean {
  return process.env.ALLOW_MOCK_WECHAT_LOGIN === 'true' && process.env.NODE_ENV !== 'production';
}
