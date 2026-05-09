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
import { useI18n } from '../i18n';
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
  const { t } = useI18n();
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
      setNotice(toFriendlyMemberError(error, 'load', t));
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
      setNotice(profile.memberNo ? t('member.profileUpdated') : t('member.registered'));
    } catch (error) {
      setNotice(toFriendlyMemberError(error, 'save', t));
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
      setNotice(t('member.address.created'));
    } catch (error) {
      setNotice(toFriendlyMemberError(error, 'address', t));
    } finally {
      setSavingAddress(false);
    }
  }

  function logout() {
    clearMemberSession();
    resetSession(null);
    setProfile(emptyProfile);
    setAddresses([]);
    setNotice(t('member.loggedOut'));
  }

  async function removeAddress(id: string | number) {
    if (!window.confirm(t('member.address.confirmDelete'))) {
      return;
    }
    try {
      await deleteMyAddress(id);
      setAddresses((current) => current.filter((item) => String(item.id) !== String(id)));
      setNotice(t('member.address.deleted'));
    } catch (error) {
      setNotice(toFriendlyMemberError(error, 'address', t));
    }
  }

  async function makeDefault(id: string | number) {
    try {
      await setDefaultMyAddress(id);
      setAddresses((current) => current.map((item) => ({ ...item, isDefault: String(item.id) === String(id) })));
      setNotice(t('member.address.defaultSet'));
    } catch (error) {
      setNotice(toFriendlyMemberError(error, 'address', t));
    }
  }

  return (
    <div className="lc-subpage">
      <H5PageChrome title={t('member.hero.title')} subtitle={t('member.hero.subtitle')} />
      <PageHero kicker={t('member.hero.eyebrow')} title={t('member.hero.title')} desc={t('member.hero.desc')}>
        <div className="lc-member-actions">
          <button className="lc-button ghost" type="button" onClick={load} disabled={loading}>
            {loading ? t('member.refreshing') : t('member.refresh')}
          </button>
          <button className="lc-button ghost" type="button" onClick={logout}>
            {t('member.logout')}
          </button>
        </div>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container lc-member-layout">
          <section className="lc-card lc-form-panel">
            <div className="lc-member-title">
              <div>
                <p className="lc-kicker">{t('member.profile.kicker')}</p>
                <h2>{profile.memberNo ? t('member.profile.title') : t('member.register.title')}</h2>
              </div>
              <span>
                {profile.memberNo ? `${t('member.memberNo')} ${profile.memberNo}` : t('member.registerHint')}
              </span>
            </div>
            {notice ? <p className="lc-notice">{notice}</p> : null}
            <form className="lc-form-grid" onSubmit={saveProfile}>
              <Field label={t('member.field.nickname')}>
                <input value={profile.nickname ?? session?.user?.nickname ?? ''} onChange={(event) => setProfile((current) => ({ ...current, nickname: event.target.value }))} />
              </Field>
              <Field label={t('member.field.mobile')}>
                <input value={profile.mobile ?? ''} onChange={(event) => setProfile((current) => ({ ...current, mobile: event.target.value }))} />
              </Field>
              <Field label={t('member.field.customerType')}>
                <select value={profile.customerType ?? 'personal'} onChange={(event) => setProfile((current) => ({ ...current, customerType: event.target.value as MemberProfile['customerType'] }))}>
                  <option value="personal">{t('quote.customer.personal')}</option>
                  <option value="company">{t('quote.customer.company')}</option>
                </select>
              </Field>
              <Field label={t('member.field.contactName')}>
                <input value={profile.contactName ?? ''} onChange={(event) => setProfile((current) => ({ ...current, contactName: event.target.value }))} />
              </Field>
              <Field label={t('member.field.companyName')}>
                <input value={profile.companyName ?? ''} onChange={(event) => setProfile((current) => ({ ...current, companyName: event.target.value }))} />
              </Field>
              <Field label={t('member.field.taxNo')}>
                <input value={profile.taxNo ?? ''} onChange={(event) => setProfile((current) => ({ ...current, taxNo: event.target.value }))} />
              </Field>
              <Field label={t('member.field.industry')}>
                <input value={profile.industry ?? ''} onChange={(event) => setProfile((current) => ({ ...current, industry: event.target.value }))} />
              </Field>
              <Field label={t('member.field.remark')}>
                <input value={profile.remark ?? ''} onChange={(event) => setProfile((current) => ({ ...current, remark: event.target.value }))} />
              </Field>
              <div className="lc-field-wide">
                <button className="lc-button primary" type="submit" disabled={savingProfile}>
                  {savingProfile ? t('member.saving') : profile.memberNo ? t('member.updateProfile') : t('member.register')}
                </button>
              </div>
            </form>
          </section>

          <section className="lc-card lc-form-panel">
            <div className="lc-member-title">
              <div>
                <p className="lc-kicker">{t('member.address.kicker')}</p>
                <h2>{t('member.address.title')}</h2>
              </div>
              <span>
                {addresses.length} {t('member.address.count')}
              </span>
            </div>
            {addresses.length === 0 ? (
              <p className="lc-empty-copy">{t('member.address.empty')}</p>
            ) : (
              <ul className="lc-address-list">
                {addresses.map((address) => (
                  <li key={address.id}>
                    <strong>
                      {address.consignee} / {address.mobile}
                      {address.isDefault ? <em>{t('member.address.default')}</em> : null}
                    </strong>
                    <span>
                      {address.province} {address.city} {address.district ?? ''} {address.detail}
                    </span>
                    <div>
                      {!address.isDefault ? (
                        <button type="button" onClick={() => makeDefault(address.id)}>
                          {t('member.address.setDefault')}
                        </button>
                      ) : null}
                      <button type="button" onClick={() => removeAddress(address.id)}>
                        {t('member.address.delete')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <form className="lc-form-grid" onSubmit={saveAddress}>
              <Field label={t('member.address.consignee')}>
                <input required value={addressDraft.consignee} onChange={(event) => setAddressDraft((current) => ({ ...current, consignee: event.target.value }))} />
              </Field>
              <Field label={t('member.field.mobile')}>
                <input required value={addressDraft.mobile} onChange={(event) => setAddressDraft((current) => ({ ...current, mobile: event.target.value }))} />
              </Field>
              <Field label={t('member.address.province')}>
                <input required value={addressDraft.province} onChange={(event) => setAddressDraft((current) => ({ ...current, province: event.target.value }))} />
              </Field>
              <Field label={t('member.address.city')}>
                <input required value={addressDraft.city} onChange={(event) => setAddressDraft((current) => ({ ...current, city: event.target.value }))} />
              </Field>
              <Field label={t('member.address.district')}>
                <input value={addressDraft.district ?? ''} onChange={(event) => setAddressDraft((current) => ({ ...current, district: event.target.value }))} />
              </Field>
              <Field label={t('member.address.detail')}>
                <input required value={addressDraft.detail} onChange={(event) => setAddressDraft((current) => ({ ...current, detail: event.target.value }))} />
              </Field>
              <div className="lc-toggle-row lc-field-wide">
                <label>
                  <input type="checkbox" checked={!!addressDraft.isDefault} onChange={(event) => setAddressDraft((current) => ({ ...current, isDefault: event.target.checked }))} />
                  {t('member.address.setAsDefault')}
                </label>
                <button className="lc-button primary" type="submit" disabled={savingAddress}>
                  {savingAddress ? t('member.saving') : t('member.address.add')}
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

function toFriendlyMemberError(error: unknown, action: 'load' | 'save' | 'address', t: ReturnType<typeof useI18n>['t']): string {
  const message = error instanceof Error ? error.message : '';
  if (/HTTP\s*5\d\d|Failed to fetch|NetworkError/i.test(message)) {
    if (action === 'load') {
      return t('member.error.load');
    }

    if (action === 'save') {
      return t('member.error.save');
    }

    return t('member.error.address');
  }

  return message || t('member.error.default');
}
