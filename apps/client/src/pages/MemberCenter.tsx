import { FormEvent, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clearMemberSession,
  createMyAddress,
  deleteMyAddress,
  fetchMyAddresses,
  fetchMyProfile,
  registerMyProfile,
  setDefaultMyAddress,
} from '../api';
import { useCatalog } from '../catalogContext';
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
import { PageHero } from '../components/PageHero';
import type { MemberAddress, MemberProfile } from '../types';

const emptyProfile: MemberProfile = {
  mobile: '',
  nickname: '',
  customerType: 'personal',
  companyName: '',
  contactName: '',
  taxNo: '',
  industry: '',
  remark: '',
};

const emptyAddress: Omit<MemberAddress, 'id'> = {
  consignee: '',
  mobile: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: true,
};

export function MemberCenterPage() {
  const { session, ensureSession, resetSession } = useCatalog();
  const [profile, setProfile] = useState<MemberProfile>(emptyProfile);
  const [addresses, setAddresses] = useState<MemberAddress[]>([]);
  const [addressDraft, setAddressDraft] = useState<Omit<MemberAddress, 'id'>>(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [notice, setNotice] = useState<string>('');

  async function load() {
    setLoading(true);
    setNotice('');
    try {
      await ensureSession();
      const [remoteProfile, remoteAddresses] = await Promise.all([
        fetchMyProfile().catch(() => null),
        fetchMyAddresses().catch(() => []),
      ]);
      if (remoteProfile) {
        setProfile({ ...emptyProfile, ...remoteProfile });
      }
      setAddresses(remoteAddresses ?? []);
    } catch (error) {
      setNotice(toFriendlyMemberError(error, 'load'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setNotice('');
    try {
      await ensureSession();
      const saved = await registerMyProfile({
        ...profile,
        nickname: profile.nickname || session?.user?.nickname,
        source: profile.source ?? 'h5_register',
      });
      setProfile({ ...emptyProfile, ...saved });
      setNotice(profile.memberNo ? '资料已更新' : '会员注册成功');
    } catch (error) {
      setNotice(toFriendlyMemberError(error, 'save'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAddress(true);
    try {
      const created = await createMyAddress(addressDraft);
      setAddresses((current) => [created, ...current]);
      setAddressDraft(emptyAddress);
      setNotice('地址已新增');
    } catch (error) {
      setNotice(toFriendlyMemberError(error, 'address'));
    } finally {
      setSavingAddress(false);
    }
  }

  function logout() {
    clearMemberSession();
    resetSession(null);
    setProfile(emptyProfile);
    setAddresses([]);
    setNotice('已退出当前登录');
  }

  async function removeAddress(id: string | number) {
    if (!window.confirm('确认删除这条地址吗？')) {
      return;
    }
    try {
      await deleteMyAddress(id);
      setAddresses((current) => current.filter((item) => String(item.id) !== String(id)));
      setNotice('地址已删除');
    } catch (error) {
      setNotice(toFriendlyMemberError(error, 'address'));
    }
  }

  async function makeDefault(id: string | number) {
    try {
      await setDefaultMyAddress(id);
      setAddresses((current) => current.map((item) => ({ ...item, isDefault: String(item.id) === String(id) })));
      setNotice('已设为默认地址');
    } catch (error) {
      setNotice(toFriendlyMemberError(error, 'address'));
    }
  }

  return (
    <div className="lc-subpage">
      <H5PageChrome title="会员中心" subtitle="维护企业资料、联系人和收货地址" />
      <PageHero kicker="Member Center" title="会员中心" desc="维护企业资料、联系人和收货地址，方便报价保存、复购和后续交付沟通。">
        <div className="lc-member-actions">
          <button className="lc-button ghost" type="button" onClick={load} disabled={loading}>
            {loading ? '刷新中...' : '刷新'}
          </button>
          <button className="lc-button ghost" type="button" onClick={logout}>
            退出登录
          </button>
        </div>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container lc-member-layout">
          <section className="lc-card lc-form-panel">
            <div className="lc-member-title">
              <div>
                <p className="lc-kicker">Profile</p>
                <h2>{profile.memberNo ? '会员资料' : '会员注册'}</h2>
              </div>
              <span>{profile.memberNo ? `会员编号 ${profile.memberNo}` : '填写后即可成为会员'}</span>
            </div>
            {notice ? <p className="lc-notice">{notice}</p> : null}
            <form className="lc-form-grid" onSubmit={saveProfile}>
              <Field label="昵称">
                <input value={profile.nickname ?? session?.user?.nickname ?? ''} onChange={(event) => setProfile((current) => ({ ...current, nickname: event.target.value }))} />
              </Field>
              <Field label="手机号">
                <input value={profile.mobile ?? ''} onChange={(event) => setProfile((current) => ({ ...current, mobile: event.target.value }))} />
              </Field>
              <Field label="客户类型">
                <select
                  value={profile.customerType ?? 'personal'}
                  onChange={(event) => setProfile((current) => ({ ...current, customerType: event.target.value as MemberProfile['customerType'] }))}
                >
                  <option value="personal">个人客户</option>
                  <option value="company">企业客户</option>
                </select>
              </Field>
              <Field label="联系人">
                <input value={profile.contactName ?? ''} onChange={(event) => setProfile((current) => ({ ...current, contactName: event.target.value }))} />
              </Field>
              <Field label="企业名称">
                <input value={profile.companyName ?? ''} onChange={(event) => setProfile((current) => ({ ...current, companyName: event.target.value }))} />
              </Field>
              <Field label="税号">
                <input value={profile.taxNo ?? ''} onChange={(event) => setProfile((current) => ({ ...current, taxNo: event.target.value }))} />
              </Field>
              <Field label="所属行业">
                <input value={profile.industry ?? ''} onChange={(event) => setProfile((current) => ({ ...current, industry: event.target.value }))} />
              </Field>
              <Field label="备注">
                <input value={profile.remark ?? ''} onChange={(event) => setProfile((current) => ({ ...current, remark: event.target.value }))} />
              </Field>
              <div className="lc-field-wide">
                <button className="lc-button primary" type="submit" disabled={savingProfile}>
                  {savingProfile ? '保存中...' : profile.memberNo ? '更新资料' : '注册会员'}
                </button>
              </div>
            </form>
          </section>

          <section className="lc-card lc-form-panel">
            <div className="lc-member-title">
              <div>
                <p className="lc-kicker">Address</p>
                <h2>收货地址</h2>
              </div>
              <span>{addresses.length} 条</span>
            </div>
            {addresses.length === 0 ? (
              <p className="lc-empty-copy">暂无地址</p>
            ) : (
              <ul className="lc-address-list">
                {addresses.map((address) => (
                  <li key={address.id}>
                    <strong>
                      {address.consignee} / {address.mobile}
                      {address.isDefault ? <em>默认</em> : null}
                    </strong>
                    <span>
                      {address.province} {address.city} {address.district ?? ''} {address.detail}
                    </span>
                    <div>
                      {!address.isDefault ? (
                        <button type="button" onClick={() => makeDefault(address.id)}>
                          设为默认
                        </button>
                      ) : null}
                      <button type="button" onClick={() => removeAddress(address.id)}>
                        删除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <form className="lc-form-grid" onSubmit={saveAddress}>
              <Field label="收件人">
                <input required value={addressDraft.consignee} onChange={(event) => setAddressDraft((current) => ({ ...current, consignee: event.target.value }))} />
              </Field>
              <Field label="手机号">
                <input required value={addressDraft.mobile} onChange={(event) => setAddressDraft((current) => ({ ...current, mobile: event.target.value }))} />
              </Field>
              <Field label="省">
                <input required value={addressDraft.province} onChange={(event) => setAddressDraft((current) => ({ ...current, province: event.target.value }))} />
              </Field>
              <Field label="市">
                <input required value={addressDraft.city} onChange={(event) => setAddressDraft((current) => ({ ...current, city: event.target.value }))} />
              </Field>
              <Field label="区 / 县">
                <input value={addressDraft.district ?? ''} onChange={(event) => setAddressDraft((current) => ({ ...current, district: event.target.value }))} />
              </Field>
              <Field label="详细地址">
                <input required value={addressDraft.detail} onChange={(event) => setAddressDraft((current) => ({ ...current, detail: event.target.value }))} />
              </Field>
              <div className="lc-toggle-row lc-field-wide">
                <label>
                  <input type="checkbox" checked={!!addressDraft.isDefault} onChange={(event) => setAddressDraft((current) => ({ ...current, isDefault: event.target.checked }))} />
                  设为默认
                </label>
                <button className="lc-button primary" type="submit" disabled={savingAddress}>
                  {savingAddress ? '保存中...' : '新增地址'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
      <H5TabBar />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function toFriendlyMemberError(error: unknown, action: 'load' | 'save' | 'address'): string {
  const message = error instanceof Error ? error.message : '';
  if (/HTTP\s*5\d\d|Failed to fetch|NetworkError/i.test(message)) {
    if (action === 'load') {
      return '会员服务暂时无法连接服务器，页面信息已保留，您可以稍后刷新重试。';
    }

    if (action === 'save') {
      return '会员资料暂时无法保存，请稍后在服务器恢复后重试。';
    }

    return '地址服务暂时不可用，请稍后重试。';
  }

  return message || '操作失败，请稍后重试。';
}
