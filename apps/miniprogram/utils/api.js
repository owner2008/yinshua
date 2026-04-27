const { apiBase } = require('../config');

const SESSION_KEY = 'yinshua_member_session';
const THEME_MODE_KEY = 'yinshua_theme_mode';

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
        ...(options.header || {}),
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
      },
    });
  });
}

function post(path, data) {
  return request(path, { method: 'POST', data });
}

function put(path, data) {
  return request(path, { method: 'PUT', data });
}

function del(path) {
  return request(path, { method: 'DELETE' });
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
      },
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

function toAssetUrl(path) {
  if (!path) {
    return '';
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${apiBase.replace(/\/api$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

function normalizeProduct(product) {
  if (!product) {
    return product;
  }

  return {
    ...product,
    coverImage: toAssetUrl(product.coverImage),
    galleryJson: Array.isArray(product.galleryJson) ? product.galleryJson.map(toAssetUrl) : [],
  };
}

function normalizeHomePayload(payload) {
  if (!payload) {
    return payload;
  }

  return {
    ...payload,
    branding: payload.branding
      ? {
          ...payload.branding,
          logoImage: toAssetUrl(payload.branding.logoImage),
          themeMode: normalizeThemeMode(payload.branding.themeMode),
        }
      : null,
    banners: Array.isArray(payload.banners)
      ? payload.banners.map((item) => ({
          ...item,
          imageUrl: toAssetUrl(item.imageUrl),
          mobileImageUrl: toAssetUrl(item.mobileImageUrl),
        }))
      : [],
    companyProfile: payload.companyProfile
      ? {
          ...payload.companyProfile,
          coverImage: toAssetUrl(payload.companyProfile.coverImage),
          galleryJson: Array.isArray(payload.companyProfile.galleryJson)
            ? payload.companyProfile.galleryJson.map(toAssetUrl)
            : [],
        }
      : null,
    hotProducts: Array.isArray(payload.hotProducts) ? payload.hotProducts.map(normalizeProduct) : [],
    latestProducts: Array.isArray(payload.latestProducts) ? payload.latestProducts.map(normalizeProduct) : [],
    categoryEquipmentShowcases: Array.isArray(payload.categoryEquipmentShowcases)
      ? payload.categoryEquipmentShowcases.map((item) => ({
          ...item,
          imageUrl: toAssetUrl(item.imageUrl),
          galleryJson: Array.isArray(item.galleryJson) ? item.galleryJson.map(toAssetUrl) : [],
        }))
      : [],
  };
}

function normalizeThemeMode(value) {
  return value === 'ivory' || value === 'forest' ? value : 'graphite';
}

function saveThemeMode(themeMode) {
  wx.setStorageSync(THEME_MODE_KEY, normalizeThemeMode(themeMode));
}

function getThemeMode() {
  return normalizeThemeMode(wx.getStorageSync(THEME_MODE_KEY));
}

function applyThemeMode(page, themeMode) {
  const nextTheme = normalizeThemeMode(themeMode);
  page.setData({ themeMode: nextTheme });
  saveThemeMode(nextTheme);
  applyNavigationBar(nextTheme);
  return nextTheme;
}

function applyStoredThemeMode(page) {
  return applyThemeMode(page, getThemeMode());
}

function syncThemeModeFromBranding(page, branding) {
  return applyThemeMode(page, branding && branding.themeMode);
}

function refreshThemeMode(page) {
  return request('/catalog/home')
    .then((payload) => normalizeHomePayload(payload))
    .then((payload) => applyThemeMode(page, payload && payload.branding && payload.branding.themeMode))
    .catch(() => applyStoredThemeMode(page));
}

function applyNavigationBar(themeMode) {
  const palette = getThemePalette(themeMode);
  wx.setNavigationBarColor({
    frontColor: palette.frontColor,
    backgroundColor: palette.backgroundColor,
    animation: {
      duration: 120,
      timingFunc: 'easeIn',
    },
  });
}

function getThemePalette(themeMode) {
  if (themeMode === 'ivory') {
    return {
      frontColor: '#000000',
      backgroundColor: '#efe5d8',
    };
  }
  if (themeMode === 'forest') {
    return {
      frontColor: '#ffffff',
      backgroundColor: '#14211c',
    };
  }
  return {
    frontColor: '#ffffff',
    backgroundColor: '#111827',
  };
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
  applyStoredThemeMode,
  applyThemeMode,
  clearSession,
  del,
  getSession,
  getThemeMode,
  loginMember,
  normalizeHomePayload,
  normalizeProduct,
  normalizeThemeMode,
  post,
  put,
  refreshThemeMode,
  request,
  saveThemeMode,
  syncThemeModeFromBranding,
  toAssetUrl,
};
