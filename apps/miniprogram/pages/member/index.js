const { clearSession, del, loginMember, post, put, request } = require('../../utils/api');

const customerTypes = [
  { label: '个人客户', value: 'personal' },
  { label: '企业客户', value: 'company' }
];

const emptyProfile = {
  mobile: '',
  nickname: '',
  customerType: 'personal',
  contactName: '',
  companyName: '',
  taxNo: '',
  industry: '',
  remark: ''
};

const emptyAddress = {
  consignee: '',
  mobile: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: true
};

Page({
  data: {
    notice: '',
    session: null,
    profile: emptyProfile,
    customerTypeLabels: customerTypes.map((item) => item.label),
    selectedCustomerTypeIndex: 0,
    addresses: [],
    addressDraft: emptyAddress,
    savingProfile: false,
    savingAddress: false,
    loading: false
  },

  onShow() {
    this.init();
  },

  init() {
    this.setData({ loading: true, notice: '' });
    loginMember()
      .then((session) => {
        this.setData({ session });
        return Promise.all([
          request('/member/profile').catch(() => null),
          request('/member/addresses').catch(() => [])
        ]);
      })
      .then(([profile, addresses]) => {
        const nextProfile = Object.assign({}, emptyProfile, profile || {});
        const customerIndex = Math.max(
          0,
          customerTypes.findIndex((item) => item.value === (nextProfile.customerType || 'personal'))
        );
        this.setData({
          profile: nextProfile,
          selectedCustomerTypeIndex: customerIndex,
          addresses: addresses || [],
          loading: false
        });
      })
      .catch((error) => {
        this.setData({ loading: false, notice: error.message || '加载失败' });
      });
  },

  changeProfileField(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`profile.${field}`]: event.detail.value });
  },

  changeCustomerType(event) {
    const idx = Number(event.detail.value);
    this.setData({
      selectedCustomerTypeIndex: idx,
      'profile.customerType': customerTypes[idx].value
    });
  },

  saveProfile() {
    this.setData({ savingProfile: true, notice: '' });
    post('/member/register', Object.assign({ source: 'miniprogram_register' }, this.data.profile))
      .then((saved) => {
        this.setData({
          profile: Object.assign({}, emptyProfile, saved),
          savingProfile: false,
          notice: saved.memberNo ? '会员资料已保存' : '会员注册成功'
        });
        wx.showToast({ title: '已保存', icon: 'success' });
      })
      .catch((error) => {
        this.setData({ savingProfile: false, notice: error.message || '保存失败' });
      });
  },

  changeAddressField(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`addressDraft.${field}`]: event.detail.value });
  },

  toggleDefault(event) {
    this.setData({ 'addressDraft.isDefault': event.detail.value });
  },

  saveAddress() {
    const draft = this.data.addressDraft;
    if (!draft.consignee || !draft.mobile || !draft.province || !draft.city || !draft.detail) {
      wx.showToast({ title: '请完善地址', icon: 'none' });
      return;
    }
    this.setData({ savingAddress: true });
    post('/member/addresses', draft)
      .then((created) => {
        this.setData({
          addresses: [created].concat(this.data.addresses),
          addressDraft: emptyAddress,
          savingAddress: false,
          notice: '地址已新增'
        });
        wx.showToast({ title: '已新增地址', icon: 'success' });
      })
      .catch((error) => {
        this.setData({ savingAddress: false, notice: error.message || '新增失败' });
      });
  },

  logout() {
    clearSession();
    this.setData({
      session: null,
      profile: emptyProfile,
      addresses: [],
      notice: '已退出登录'
    });
  },

  reload() {
    this.init();
  },

  addressActions(event) {
    const id = event.currentTarget.dataset.id;
    const address = this.data.addresses.find((item) => String(item.id) === String(id));
    if (!address) {
      return;
    }
    const items = [];
    if (!address.isDefault) {
      items.push('设为默认');
    }
    items.push('删除');
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        const label = items[res.tapIndex];
        if (label === '设为默认') {
          this.setDefaultAddress(id);
        } else if (label === '删除') {
          this.deleteAddress(id);
        }
      }
    });
  },

  setDefaultAddress(id) {
    put(`/member/addresses/${id}/default`, {})
      .then(() => {
        this.setData({
          addresses: this.data.addresses.map((item) => ({
            ...item,
            isDefault: String(item.id) === String(id)
          })),
          notice: '已设为默认地址'
        });
      })
      .catch((error) => {
        wx.showToast({ title: error.message || '设置失败', icon: 'none' });
      });
  },

  deleteAddress(id) {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        del(`/member/addresses/${id}`)
          .then(() => {
            this.setData({
              addresses: this.data.addresses.filter((item) => String(item.id) !== String(id)),
              notice: '地址已删除'
            });
          })
          .catch((error) => {
            wx.showToast({ title: error.message || '删除失败', icon: 'none' });
          });
      }
    });
  }
});
