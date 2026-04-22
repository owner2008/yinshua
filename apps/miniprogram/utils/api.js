const { apiBase } = require('../config');

const SESSION_KEY = 'yinshua_member_session';

function request(path, options = {}) {
  const session = getSession();
  const url = `${apiBase}${path}`;
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        ...(options.header || {})
      },
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }

        if (response.statusCode === 401) {
          clearSession();
        }
        const message = parseError(response.data) || `HTTP ${response.statusCode}`;
        console.error('[api] request failed', { url, statusCode: response.statusCode, data: response.data });
        reject(new Error(message));
      },
      fail(error) {
        const message = formatNetworkError(error.errMsg || '请求失败');
        console.error('[api] request error', { url, error });
        reject(new Error(message));
      }
    });
  });
}

function post(path, data) {
  return request(path, { method: 'POST', data });
}

function loginMember() {
  const existing = getSession();
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve, reject) => {
    wx.login({
      success(result) {
        if (!result.code) {
          reject(new Error('微信登录失败'));
          return;
        }

        post('/auth/wx-login', { code: result.code })
          .then((session) => {
            saveSession(session);
            resolve(session);
          })
          .catch(reject);
      },
      fail(error) {
        reject(new Error(error.errMsg || '微信登录失败'));
      }
    });
  });
}

function getSession() {
  const session = wx.getStorageSync(SESSION_KEY);
  if (!session || !session.expiresAt || new Date(session.expiresAt).getTime() <= Date.now()) {
    clearSession();
    return null;
  }
  return session;
}

function saveSession(session) {
  wx.setStorageSync(SESSION_KEY, session);
}

function clearSession() {
  wx.removeStorageSync(SESSION_KEY);
}

function parseError(data) {
  if (!data) {
    return '';
  }
  if (typeof data === 'string') {
    return data;
  }
  if (Array.isArray(data.message)) {
    return data.message.join('；');
  }
  return data.message || data.error || '';
}

function formatNetworkError(message) {
  if (message.includes('url not in domain list') || message.includes('合法域名')) {
    return '本地调试请求被合法域名校验拦截，请关闭校验或配置 HTTPS request 合法域名';
  }
  if (message.includes('fail')) {
    return message;
  }
  return `请求失败：${message}`;
}

module.exports = {
  clearSession,
  getSession,
  loginMember,
  post,
  request
};
