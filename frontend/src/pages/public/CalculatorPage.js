/**
 *  CalculatorPage — DM Auto, Europe (mail.de) → Belarus / Russia pipeline.
 *
 *  The historical multi-origin pipeline (USA / Korea via Bulgaria & Romania)
 *  has been retired: the business now imports exclusively from European
 *  auctions (mail.de) into Belarus, with Russia as a secondary destination.
 *  The Figma layout (1720 × 1133 grey block, 374×45 buttons, 748×45 input,
 *  325×45 CTA, 72 px inner padding, 80 px column gap) and every CSS class
 *  in ``CalculatorPage.module.css`` are preserved verbatim.
 *
 *  Computation is performed locally with admin-tunable defaults below — the
 *  prior backend pipeline assumed Bulgaria customs which doesn't match the
 *  new business model. The CTA still submits a lead via the existing
 *  endpoints for capture / CRM continuity.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useLang } from '../../i18n';
import styles from './CalculatorPage.module.css';
import PageHero from '../../components/public/PageHero';
import { trackCalculatorUse, trackLeadSubmit } from '../../lib/tracker';

const API = process.env.REACT_APP_BACKEND_URL || '';

const fmtEUR = (v) => `€${Math.round(Number(v) || 0).toLocaleString('en-US')}`;

const MAX_PRICE_DIGITS = 7;
const formatThousands = (digits) =>
  digits ? String(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';

/* Bilingual UI labels (EN + RU). The translation system uses lang === 'ru'
 * (BG translations were removed because Bulgaria is no longer a market). */
const CALC_T = {
  en: {
    crumbHome: 'home',
    crumbCalc: 'calculator',
    pageTitle: 'calculator',
    subA: 'Calculate the approximate cost ',
    subB: 'of your car and send a request ',
    subC: 'for a consultation',
    calcForm: 'Calculation Form',
    destinationLabel: 'Destination country',
    vehicleLabel: 'Vehicle',
    priceLabel: 'Vehicle purchase price (mail.de)',
    pricePh: 'Enter the amount',
    damageLabel: 'Vehicle damage status',
    notDamaged: 'not damaged',
    damaged: 'damaged',
    costEstimate: 'Cost Estimate',
    purchasePrice: 'Vehicle purchase price',
    auctionFee: 'mail.de auction fee',
    carAuctionTot: 'CAR & AUCTION',
    inlineEU: 'EU inland transport (seller → border)',
    crossBorder: (d) => `Cross-border delivery to ${d}`,
    insurance: 'Transport insurance',
    brokerage: 'Customs brokerage & paperwork',
    logisticsTot: (d) => `LOGISTICS TO ${d.toUpperCase()}`,
    customsDuty: 'Customs duty (import tax)',
    vat: (d, p) => `VAT ${d} (${p}%)`,
    bibiFee: 'DM Auto service fee',
    deliveryLocal: (d) => `Local delivery (${d})`,
    registrationFee: 'Registration / certification',
    customsTot: 'CUSTOMS & FINAL FEES',
    grandTotal: 'total approximate cost',
    approxEm: 'Approximate estimate',
    approxRest: '. Final cost depends on actual auction result, current freight rates and individual customs assessment. Contact DM Auto for a precise binding quote.',
    submitting: 'Submitting…',
    cta: 'I want a complete calculation',
    motorbike: 'motorbike', sedan: 'sedan', suv: 'SUV', pickup: 'Pick-up', van: 'Van',
    destBY: 'Belarus', destRU: 'Russia',
    toastPriceRequired: 'Please enter the vehicle purchase price first.',
    toastSuccessPrecise: 'Got it! Our team will reach out with a precise binding quote.',
    toastSuccessShort: 'Request received. We will be in touch shortly.',
    toastSubmitError: 'Could not submit your request. Please try again or contact us directly.',
  },
  ru: {
    crumbHome: 'главная',
    crumbCalc: 'калькулятор',
    pageTitle: 'калькулятор',
    subA: 'Рассчитайте ориентировочную цену ',
    subB: 'вашего автомобиля и отправьте заявку ',
    subC: 'на консультацию',
    calcForm: 'Форма расчёта',
    destinationLabel: 'Страна доставки',
    vehicleLabel: 'Тип транспорта',
    priceLabel: 'Цена покупки на mail.de',
    pricePh: 'Введите сумму',
    damageLabel: 'Состояние повреждений',
    notDamaged: 'без повреждений',
    damaged: 'повреждён',
    costEstimate: 'Оценка стоимости',
    purchasePrice: 'Цена покупки',
    auctionFee: 'Аукционный сбор mail.de',
    carAuctionTot: 'АВТО И АУКЦИОН',
    inlineEU: 'Перевозка по ЕС (продавец → граница)',
    crossBorder: (d) => `Доставка через границу до ${d}`,
    insurance: 'Транспортная страховка',
    brokerage: 'Таможенный брокер и документы',
    logisticsTot: (d) => `ЛОГИСТИКА ДО ${d.toUpperCase()}`,
    customsDuty: 'Пошлина (импортный сбор)',
    vat: (d, p) => `НДС ${d} (${p}%)`,
    bibiFee: 'Сервисный сбор DM Auto',
    deliveryLocal: (d) => `Локальная доставка (${d})`,
    registrationFee: 'Регистрация / сертификация',
    customsTot: 'ПОШЛИНА И КОНЕЧНЫЕ СБОРЫ',
    grandTotal: 'итоговая ориентировочная цена',
    approxEm: 'Приблизительная оценка',
    approxRest: '. Финальная цена зависит от результата аукциона, актуальных фрахтов и индивидуальной таможенной оценки. Свяжитесь с DM Auto для точного расчёта.',
    submitting: 'Отправка…',
    cta: 'Хочу полный расчёт',
    motorbike: 'мотоцикл', sedan: 'седан', suv: 'SUV', pickup: 'Пикап', van: 'Ван',
    destBY: 'Беларусь', destRU: 'Россия',
    toastPriceRequired: 'Пожалуйста, сначала введите цену автомобиля.',
    toastSuccessPrecise: 'Заявка получена! Наша команда свяжется с вами с точным расчётом.',
    toastSuccessShort: 'Заявка получена. Мы скоро свяжемся с вами.',
    toastSubmitError: 'Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь напрямую.',
  },
};

/* ── Vehicle icons (40 × 40 single-tone PNGs, design-system) ─────────── */
const VEHICLE_TYPES = [
  { code: 'motorbike', label: 'motorbike', icon: '/figma/calc/veh-motorbike.png', apiType: 'motorcycle' },
  { code: 'sedan',     label: 'sedan',     icon: '/figma/calc/veh-sedan.png',     apiType: 'sedan'  },
  { code: 'suv',       label: 'SUV',       icon: '/figma/calc/veh-suv.png',       apiType: 'suv'    },
  { code: 'pickup',    label: 'Pick-up',   icon: '/figma/calc/veh-pickup.png',    apiType: 'pickup' },
  { code: 'van',       label: 'Van',       icon: '/figma/calc/veh-van.png',       apiType: 'bigSUV' },
];

const DESTINATIONS = [
  { code: 'by', label: 'Belarus', flag: '/figma/flag-by.svg' },
  { code: 'ru', label: 'Russia',  flag: '/figma/flag-ru.svg' },
];

/* ── Calculation profiles per destination (admin-tunable later) ─────────
 * Cost model for Europe (mail.de) → destination pipeline:
 *
 *   1. Vehicle price (user input, € from mail.de listing)
 *   2. Auction fee  — flat + percent (mail.de standard structure)
 *   3. Logistics    — EU inland (seller → EU border), cross-border road
 *                     transport, transport insurance, customs brokerage
 *   4. Customs      — duty %, VAT %, DM Auto service fee, local delivery,
 *                     registration / certification
 *
 * Numbers are intentionally on the conservative side (slightly higher
 * than typical) so the user is pleasantly surprised by the final binding
 * quote rather than the opposite.
 */
const DESTINATION_PROFILES = {
  by: {
    label: 'Belarus',
    vatRate: 20,                    // % — Belarus VAT
    customsDutyRate: 0.18,          // 18 % of customs value
    damagedCustomsFactor: 0.65,     // damaged cars are revalued lower
    crossBorder: { motorcycle: 600, sedan: 900, suv: 1050, bigSUV: 1300, pickup: 1200 },
    localDelivery: { motorcycle: 200, sedan: 350, suv: 400, bigSUV: 500, pickup: 450 },
    registrationFee: 250,
  },
  ru: {
    label: 'Russia',
    vatRate: 20,                    // % — Russia VAT
    customsDutyRate: 0.30,          // 30 % of customs value (Russia higher)
    damagedCustomsFactor: 0.65,
    crossBorder: { motorcycle: 800, sedan: 1200, suv: 1400, bigSUV: 1700, pickup: 1550 },
    localDelivery: { motorcycle: 300, sedan: 500, suv: 600, bigSUV: 750, pickup: 700 },
    registrationFee: 350,
  },
};

/* Common shipping/handling components (same for both destinations,
 * sourced from EU side). Per-vehicle scaling baked in below. */
const EU_INLAND_BY_VEHICLE = {
  motorcycle: 350, sedan: 550, suv: 650, bigSUV: 800, pickup: 720,
};
const TRANSPORT_INSURANCE_PCT = 0.012;   // 1.2 % of (price + auction fee)
const TRANSPORT_INSURANCE_MIN = 90;
const CUSTOMS_BROKERAGE_FLAT  = 250;
const DM_AUTO_SERVICE_FEE     = 950;

/**
 * mail.de auction fee — a simplified piece-wise model derived from the
 * 2025 public fee schedule (gross seller charges). Returns a number in EUR.
 *   • Tiered absolute fee for very low prices
 *   • 7.5 % of price + €120 commission above €5 000
 *   • Soft ceiling around €4 200 for super-luxury cars
 */
const computeAuctionFee = (price) => {
  if (price <= 0) return 0;
  if (price <  1500) return 180;
  if (price <  3000) return 230;
  if (price <  5000) return 320;
  const fee = price * 0.075 + 120;
  return Math.min(4200, Math.round(fee));
};

const computeQuote = ({ price, vehicleType, damaged, destination }) => {
  const apiType = (VEHICLE_TYPES.find(v => v.code === vehicleType) || VEHICLE_TYPES[1]).apiType;
  const profile = DESTINATION_PROFILES[destination] || DESTINATION_PROFILES.by;

  const auctionFee = computeAuctionFee(price);
  const carAuction = price + auctionFee;

  // Logistics
  const inlineEU      = EU_INLAND_BY_VEHICLE[apiType] ?? EU_INLAND_BY_VEHICLE.sedan;
  const crossBorder   = profile.crossBorder[apiType]   ?? profile.crossBorder.sedan;
  const insurance     = Math.max(TRANSPORT_INSURANCE_MIN, carAuction * TRANSPORT_INSURANCE_PCT);
  const brokerage     = CUSTOMS_BROKERAGE_FLAT;
  const logistics     = inlineEU + crossBorder + insurance + brokerage;

  // Customs base: damaged cars get a salvage-style undervalue factor
  const customsBase   = damaged ? carAuction * profile.damagedCustomsFactor : carAuction;
  const customsDuty   = customsBase * profile.customsDutyRate;
  const vat           = (customsBase + customsDuty) * (profile.vatRate / 100);

  const localDelivery = profile.localDelivery[apiType] ?? profile.localDelivery.sedan;
  const registration  = profile.registrationFee;

  const customsFinal  = customsDuty + vat + DM_AUTO_SERVICE_FEE + localDelivery + registration;

  return {
    price,
    auctionFee,
    carAuction,
    inlineEU,
    crossBorder,
    insurance,
    brokerage,
    logistics,
    customsDuty,
    vat,
    vatRate: profile.vatRate,
    bibiFee: DM_AUTO_SERVICE_FEE,
    deliveryLocal: localDelivery,
    registration,
    customsFinal,
    grand: carAuction + logistics + customsFinal,
  };
};

/* Cost-estimate primitives */
const Row = ({ label, value }) => (
  <div className={styles.estRow}>
    <div className={styles.lbl}>{label}</div>
    <div className={styles.val}>{value}</div>
  </div>
);
const GroupTotal = ({ label, value }) => (
  <div className={styles.estGroupTotal}>
    <div className={styles.gtLbl}>{label}</div>
    <div className={styles.gtVal}>{value}</div>
  </div>
);

const EMPTY_CALC = {
  price: 0, auctionFee: 0, carAuction: 0,
  inlineEU: 0, crossBorder: 0, insurance: 0, brokerage: 0, logistics: 0,
  customsDuty: 0, vat: 0, vatRate: 20, bibiFee: 0,
  deliveryLocal: 0, registration: 0, customsFinal: 0,
  grand: 0,
};

/* ====================================================================== */

export default function CalculatorPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const { lang } = useLang();
  const T = lang === 'ru' ? CALC_T.ru : CALC_T.en;

  const initialPrice = (() => {
    const q = params.get('price');
    if (q == null || q === '') return '';
    const n = Number(q);
    if (!Number.isFinite(n) || n <= 0) return '';
    return String(Math.round(n)).slice(0, MAX_PRICE_DIGITS);
  })();
  const initialVin = (params.get('vin') || params.get('lot') || '').toUpperCase();

  const [destination, setDestination] = useState('by');   // Belarus default
  const [vehicle, setVehicle] = useState(null);
  const [priceStr, setPriceStr] = useState(initialPrice);
  const [damaged, setDamaged] = useState(false);
  const [vin] = useState(initialVin);

  const [calc, setCalc] = useState(EMPTY_CALC);
  const [submitting, setSubmitting] = useState(false);

  /* ── Live recompute on every input change (no network, instant) ────── */
  const debounceRef = useRef(null);
  const recompute = useCallback(() => {
    const price = Number(priceStr) || 0;
    if (price <= 0) { setCalc(EMPTY_CALC); return; }
    trackCalculatorUse({ vin: vin || undefined });
    const next = computeQuote({
      price,
      vehicleType: vehicle || 'sedan',
      damaged,
      destination,
    });
    setCalc(next);
  }, [destination, vehicle, priceStr, damaged, vin]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(recompute, 150);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [recompute]);

  /* ── CTA submit ─────────────────────────────────────────────────────── */
  const handleCta = async () => {
    const price = Number(priceStr) || 0;
    if (!price || price <= 0) {
      toast.error(T.toastPriceRequired);
      return;
    }
    setSubmitting(true);
    const apiType = (VEHICLE_TYPES.find(v => v.code === vehicle) || VEHICLE_TYPES[1]).apiType;
    const destLabel = destination === 'ru' ? T.destRU : T.destBY;
    const snapshotPayload = {
      origin: 'europe',
      destination,
      vehicleType: apiType,
      price,
      damaged,
      vin: vin || undefined,
      source: 'public_calculator',
      auctionPlatform: 'mail.de',
      breakdown: calc,
    };
    let calculationId = null;
    let computedTotal = calc?.grand || 0;
    try {
      const snap = await axios.post(`${API}/api/calculations`, snapshotPayload);
      calculationId = snap?.data?.calculation?.id || null;
      computedTotal = snap?.data?.calculation?.outputs?.total || computedTotal;
    } catch (_) { /* snapshot is nice-to-have, lead flow continues */ }

    try {
      await axios.post(`${API}/api/public/leads/from-quote`, {
        calculationId,
        origin: 'europe',
        destination,
        vehicleType: apiType,
        price,
        damaged,
        vin: vin || undefined,
        total: computedTotal,
        currency: 'EUR',
        source: 'calculator',
        message: `Calculator request — mail.de → ${destLabel} / ${vehicle || 'sedan'} / €${price.toLocaleString()} / ${damaged ? 'damaged' : 'not damaged'}${vin ? ' / VIN ' + vin : ''}${calculationId ? ' / calc ' + calculationId : ''}`,
      });
      toast.success(T.toastSuccessPrecise);
      trackLeadSubmit({ vin: vin || undefined });
    } catch (_) {
      try {
        await axios.post(`${API}/api/quick-leads`, {
          name: 'Calculator request',
          phone: '',
          message: `Calculator quote request — mail.de → ${destLabel} / ${vehicle || 'sedan'} / €${price} / ${damaged ? 'damaged' : 'not damaged'}${vin ? ' / VIN ' + vin : ''}${calculationId ? ' / calc ' + calculationId : ''}`,
          source: 'calculator',
        });
        toast.success(T.toastSuccessShort);
      } catch {
        toast.error(T.toastSubmitError);
        setSubmitting(false);
        return;
      }
    }
    navigate('/contacts', { state: { source: 'calculator', calculationId, payload: snapshotPayload } });
    setSubmitting(false);
  };

  const destLabel = destination === 'ru' ? T.destRU : T.destBY;

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className={styles.calcPage} data-testid="calculator-page">
      <PageHero
        home={T.crumbHome}
        crumbs={[{ label: T.crumbCalc }]}
        title={T.pageTitle}
        testId="calculator-hero"
      />
      <div className={styles.container}>
        <div className={styles.subBox} data-testid="calculator-subtitle">
          <svg
            className={styles.bracketL}
            viewBox="0 0 17 80"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M14.5264 1.5H1.5V77.5264H14.5264"
              stroke="#949494"
              strokeWidth="3"
              strokeLinecap="square"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <h2 className={styles.subText}>
            <span>{T.subA}</span><br />
            <span className={styles.subWhite}>
              {T.subB}<br />
              {T.subC}
            </span>
          </h2>
          <svg
            className={styles.bracketR}
            viewBox="0 0 17 80"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M14.5264 1.5H1.5V77.5264H14.5264"
              stroke="#949494"
              strokeWidth="3"
              strokeLinecap="square"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* THE 1720 × 1133 GRAY BLOCK */}
        <div className={styles.calcBlock} data-testid="calc-block">

          {/* ─────────────────── LEFT — Calculation Form ─────────────── */}
          <section className={`${styles.col} ${styles.colLeft}`} data-testid="calc-left">
            <div className={styles.sectionHead}><h2>{T.calcForm}</h2></div>

            <div className={styles.formStack}>
              {/* Destination country (Belarus / Russia). The legacy "Country
                  of origin" selector was removed — DM Auto sources only
                  from Europe (mail.de), so it became redundant. */}
              <div className={`${styles.field} ${styles.firstField}`}>
                <div className={styles.fieldLabel}>
                  {T.destinationLabel} <span className={styles.req}>*</span>
                </div>
                <div className={styles.ctryRow} role="tablist" aria-label={T.destinationLabel}>
                  {DESTINATIONS.map((d, i) => {
                    const active = destination === d.code;
                    const cls = i === 0 ? styles.ctryBtn : styles.ctryBtn2;
                    const label = d.code === 'by' ? T.destBY : T.destRU;
                    return (
                      <button
                        key={d.code}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        data-testid={`destination-${d.code}`}
                        onClick={() => setDestination(d.code)}
                        className={`${cls} ${active ? styles.ctryActive : ''}`}
                      >
                        <img className={styles.flag} src={d.flag} alt="" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle icons */}
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  {T.vehicleLabel} <span className={styles.req}>*</span>
                </div>
                <div className={styles.vehRow} role="radiogroup" aria-label={T.vehicleLabel}>
                  {VEHICLE_TYPES.map((v) => {
                    const active = vehicle === v.code;
                    return (
                      <button
                        key={v.code}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        data-testid={`vehicle-${v.code}`}
                        onClick={() => setVehicle(v.code)}
                        className={`${styles.vehCard} ${active ? styles.vehCardActive : ''}`}
                      >
                        <span
                          className={styles.vehIcon}
                          style={{ WebkitMaskImage: `url(${v.icon})`, maskImage: `url(${v.icon})` }}
                          aria-hidden="true"
                        />
                        <span className={styles.vehLabel}>{T[v.code] || v.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle purchase price */}
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  {T.priceLabel} <span className={styles.req}>*</span>
                </div>
                <div className={styles.priceRow}>
                  <img className={styles.priceEuro} src="/figma/calc/euro-icon.svg" alt="" />
                  <input
                    className={styles.priceInput}
                    type="text"
                    inputMode="numeric"
                    placeholder={T.pricePh}
                    value={formatThousands(priceStr)}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, MAX_PRICE_DIGITS);
                      setPriceStr(digits);
                    }}
                    maxLength={MAX_PRICE_DIGITS + Math.floor((MAX_PRICE_DIGITS - 1) / 3)}
                    data-testid="calc-price-input"
                  />
                </div>
              </div>

              {/* Vehicle damage status */}
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  {T.damageLabel} <span className={styles.req}>*</span>
                </div>
                <div className={styles.dmgRow} role="tablist" aria-label={T.damageLabel}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!damaged}
                    data-testid="dmg-not-damaged"
                    onClick={() => setDamaged(false)}
                    className={`${styles.dmgBtn} ${!damaged ? styles.dmgOk : ''}`}
                  >
                    {T.notDamaged}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={damaged}
                    data-testid="dmg-damaged"
                    onClick={() => setDamaged(true)}
                    className={`${styles.dmgBtn2} ${damaged ? styles.dmgErr : ''}`}
                  >
                    {T.damaged}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────── RIGHT — Cost Estimate ───────────────── */}
          <section
            className={`${styles.col} ${styles.colRight}`}
            data-testid="calc-right"
          >
            <div className={styles.sectionHead}><h2>{T.costEstimate}</h2></div>

            <div className={styles.estStack}>
              {/* Group 1 — Car & Auction */}
              <div className={`${styles.estGroup} ${styles.firstEstGroup}`}>
                <Row label={T.purchasePrice} value={fmtEUR(calc.price)} />
                <Row label={T.auctionFee} value={fmtEUR(calc.auctionFee)} />
                <GroupTotal label={T.carAuctionTot} value={fmtEUR(calc.carAuction)} />
              </div>

              {/* Group 2 — Logistics (Europe → destination) */}
              <div className={styles.estGroup}>
                <Row label={T.inlineEU} value={fmtEUR(calc.inlineEU)} />
                <Row label={T.crossBorder(destLabel)} value={fmtEUR(calc.crossBorder)} />
                <Row label={T.insurance} value={fmtEUR(calc.insurance)} />
                <Row label={T.brokerage} value={fmtEUR(calc.brokerage)} />
                <GroupTotal
                  label={T.logisticsTot(destLabel)}
                  value={fmtEUR(calc.logistics)}
                />
              </div>

              {/* Group 3 — Customs & Final Fees */}
              <div className={styles.estGroup}>
                <Row label={T.customsDuty} value={fmtEUR(calc.customsDuty)} />
                <Row label={T.vat(destLabel, calc.vatRate)} value={fmtEUR(calc.vat)} />
                <Row label={T.bibiFee} value={fmtEUR(calc.bibiFee)} />
                <Row label={T.deliveryLocal(destLabel)} value={fmtEUR(calc.deliveryLocal)} />
                <Row label={T.registrationFee} value={fmtEUR(calc.registration)} />
                <GroupTotal label={T.customsTot} value={fmtEUR(calc.customsFinal)} />
              </div>

              {/* TOTAL approximate cost */}
              <div className={styles.grandTotal} data-testid="calc-grand-total">
                <h3>{T.grandTotal}</h3>
                <h3 className={styles.totalVal}>{fmtEUR(calc.grand)}</h3>
              </div>

              {/* Disclaimer */}
              <div className={styles.disclaimer}>
                <span className={styles.em}>{T.approxEm}</span>
                {T.approxRest}
              </div>

              {/* CTA */}
              <button
                type="button"
                className={styles.ctaBtn}
                onClick={handleCta}
                disabled={submitting}
                data-testid="calc-cta-submit"
              >
                {submitting ? T.submitting : T.cta}
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
