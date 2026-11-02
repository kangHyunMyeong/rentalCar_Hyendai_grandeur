import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import type { Choice, Color, Engine, Trim } from './features/rental/types';
import { useChoice } from './features/rental/store';
import { simulateQuote } from './features/rental/pricing';
import { vehiclePhotos, engineNames, trimNames, money, mileageLabel } from './data/vehicle';
import { submitLead } from './services/leadSubmissionService';
import { DesignGallery } from './components/DesignGallery';
import {
  ArrowDown, ArrowLeftRight, ArrowRight, ArrowUpRight, Check, ChevronDown,
  Clock3, Info, Menu, ShieldCheck, WalletCards, X,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={'eyebrow ' + (light ? 'eyebrow-light' : '')}>{children}</div>;
}

function ChoicePills<T extends string | number>({
  items, selected, onPick, ariaLabel,
}: {
  items: { value: T; label: string; disabled?: boolean }[]; selected: T; onPick: (value: T) => void; ariaLabel: string;
}) {
  return <div className="pills" role="group" aria-label={ariaLabel}>
    {items.map((item) =>
      <button key={item.value} type="button" className={'pill ' + (selected === item.value ? 'selected' : '')}
        aria-pressed={selected === item.value} disabled={item.disabled} onClick={() => onPick(item.value)}>{item.label}</button>
    )}
  </div>;
}

function Header({ onConsult, onNavigate }: { onConsult: () => void; onNavigate: (id: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 45);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const navigate = (id: string) => {
    setOpen(false);
    onNavigate(id);
  };
  const links = [
    ['intro', '그랜저 소개'], ['estimate', '견적 알아보기'],
    ['benefits', '장기렌트 장점'], ['faq', 'FAQ'],
  ];
  return <>
    <header className={'site-header ' + (scrolled || open ? 'is-scrolled' : '')}>
      <div className="header-inner shell">
        <button className="logo" onClick={() => navigate('top')} aria-label="페이지 상단으로">
          <span className="logo-mark">F<span>.</span></span>
          <span className="logo-text"><b>핏카컴퍼니</b><small>현대 그랜저 장기렌트</small></span>
        </button>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          {links.map(([id, label]) => <button key={id} onClick={() => navigate(id)}>{label}</button>)}
        </nav>
        <div className="header-actions">
          <button className="header-cta" onClick={onConsult}>무료 견적 상담 <ArrowUpRight size={16} /></button>
          <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={open}>
            {open ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </div>
    </header>
    {open && <nav className="mobile-menu" aria-label="모바일 메뉴">
      {links.map(([id,label]) => <button key={id} onClick={() => navigate(id)}>{label}<ArrowUpRight size={16}/></button>)}
      <button className="mobile-menu-primary" onClick={() => { setOpen(false); onConsult(); }}>무료 견적 상담하기 <ArrowRight size={16}/></button>
    </nav>}
  </>;
}

function Hero({ onConsult }: { onConsult: () => void }) {
  return <section className="hero" id="top">
    <img className="hero-visual" src="/images/grandeur-hero.webp" alt="건축물 앞에 세워진 버건디 색상의 현대 그랜저" fetchPriority="high" />
    <div className="hero-noise" />
    <div className="shell hero-content">
      <div className="hero-copy">
        <Eyebrow light>그랜저를 만나는 새로운 방법</Eyebrow>
        <h1>그랜저 장기렌트,<br/><em>내 조건에 맞게.</em></h1>
        <p>원하는 트림부터 계약기간과 주행거리까지.<br/>직접 선택하고 예상 월 렌트료를 확인해 보세요.</p>
        <div className="hero-buttons">
          <a className="btn btn-gold" href="#estimate">예상 월 렌트료 확인 <ArrowUpRight size={18}/></a>
          <button className="btn btn-ghost" onClick={onConsult}>무료 견적 상담 <ArrowRight size={17}/></button>
        </div>
      </div>
      <div className="hero-bottom">
        <div><b>GRANDEUR</b><span>맞춤 견적 · 무료 상담</span></div>
        <a href="#intro" className="scroll-cue">그랜저 자세히 보기 <ArrowDown size={17}/></a>
      </div>
    </div>
  </section>;
}

function IntroDesign() {
  return <section className="intro-design section-pad" id="intro">
    <div className="shell">
      <div className="intro-row reveal">
        <div>
          <Eyebrow>THE GRANDEUR</Eyebrow>
          <h2>시선을 끄는 외관,<br/><span>머무르고 싶은 실내.</span></h2>
        </div>
        <p>첫인상을 결정하는 외관 디자인부터 매일 마주하는 실내 공간까지.<br/>
        그랜저의 디테일을 두 가지 시선으로 살펴보세요.</p>
      </div>
      <div id="design">
        <DesignGallery />
      </div>
      <p className="image-disclaimer">* 이미지 속 차량 디자인과 세부 사양은 연식 및 트림에 따라 실제와 다를 수 있습니다.</p>
    </div>
  </section>;
}

function ColorEstimate({ onConsult }: { onConsult: () => void }) {
  const s = useChoice();
  const q = simulateQuote(s);
  const selectedColor = vehiclePhotos[s.color];
  return <section className="estimate-section section-pad" id="estimate">
    <div className="shell">
      <div className="section-heading reveal">
        <Eyebrow>YOUR GRANDEUR</Eyebrow>
        <h2>마음에 드는 컬러부터,<br/><span>나에게 맞는 렌트 조건까지.</span></h2>
        <p>7가지 외장 컬러와 이용 조건을 직접 선택해 보세요. 선택한 내용은 무료 견적 상담에 자동 반영됩니다.</p>
      </div>
      <div className="estimate-layout">
        <div className="color-studio reveal">
          <div className="studio-head">
            <span>EXTERIOR COLOR</span>
            <span className="studio-index">7 COLORS</span>
          </div>
          <div className="car-preview">
            <span className="car-preview-topline">THE NEW GRANDEUR</span>
            <img key={s.color} src={selectedColor.url} alt={`${selectedColor.name} 색상의 더 뉴 그랜저`} />
            <div className="car-preview-mark">GRANDEUR</div>
          </div>
          <div className="studio-control">
            <div className="studio-selected"><span className="mini-label">선택한 외장 컬러</span><h3 aria-live="polite">{selectedColor.name}</h3></div>
            <span className="studio-surcharge">{selectedColor.surcharge ? `차량가 기준 +${money(selectedColor.surcharge)}원` : '차량가 추가금 없음'}</span>
          </div>
          <div className="color-picker-wrap">
            <div className="color-swatches" role="group" aria-label="외장 컬러 선택">
              {(Object.keys(vehiclePhotos) as Color[]).map((color) => {
                const item = vehiclePhotos[color];
                return <button key={color} className={'color-swatch ' + (color === s.color ? 'active' : '')}
                  type="button" onClick={() => s.setChoice('color', color)}
                  title={item.name} aria-label={item.name} aria-pressed={color === s.color}>
                  <span style={{ background: item.hex }}/></button>;
              })}
            </div>
          </div>
          <div className="studio-note"><Info size={14}/> 실제 차량의 색감은 화면과 다를 수 있으며, 색상별 선택 가능 여부와 추가금은 최종 견적에서 확인됩니다.</div>
          <div className="studio-bottom"><span>COLOR YOUR GRANDEUR</span><span>FITCAR COMPANY</span></div>
        </div>
        <div className="quote-panel reveal">
          <div className="quote-panel-heading">
            <div><span className="mini-label">PERSONAL ESTIMATE</span><h3>장기렌트 상세 견적</h3><p>조건을 변경하면 예상 금액이 바로 반영됩니다.</p></div>
            <span className="quote-live"><Check size={13}/> 조건 자동 반영</span>
          </div>
          <div className="quote-field">
            <label>파워트레인</label>
            <ChoicePills items={Object.entries(engineNames).map(([value,label]) => ({value: value as Engine,label}))}
              selected={s.engine} onPick={(v) => s.setChoice('engine', v)} ariaLabel="파워트레인" />
            <p className="quote-field-hint">가솔린 2.5 · LPG 3.5 (일반판매용) 기준</p>
          </div>
          <div className="quote-field">
            <label>트림</label>
            <ChoicePills items={Object.entries(trimNames).map(([value,label]) => ({value: value as Trim,label,disabled:s.engine==='lpg' && value==='calligraphy'}))}
              selected={s.trim} onPick={(v) => s.setChoice('trim', v)} ariaLabel="트림" />
            {s.engine === 'lpg' && <p className="quote-field-hint">LPG 일반판매용은 캘리그래피 트림이 제공되지 않습니다.</p>}
          </div>
          <div className="quote-field">
            <label>계약기간</label>
            <ChoicePills items={[36,48,60].map((v) => ({value:v as Choice['months'],label:`${v}개월`}))}
              selected={s.months} onPick={(v) => s.setChoice('months',v)} ariaLabel="계약기간" />
          </div>
          <div className="quote-field mileage-field">
            <label>연간 주행거리</label>
            <ChoicePills items={([10000,15000,20000,30000,'unlimited'] as Choice['mileage'][]).map((v) => ({value:v,label: v === 'unlimited' ? '무제한' : v === 15000 ? '1.5만 km' : `${Number(v) / 10000}만 km`}))}
              selected={s.mileage} onPick={(v) => s.setChoice('mileage',v)} ariaLabel="연간 주행거리" />
          </div>
          <div className="two-fields">
            <div className="quote-field">
              <label>선납금 <span className="help-tip" title="계약 시 미리 납부하고 돌려받지 않는 렌트료의 일부">ⓘ</span></label>
              <ChoicePills items={[0,10,20,30].map((v) => ({value:v as Choice['prepay'],label:`${v}%`}))}
                selected={s.prepay} onPick={(v) => s.setChoice('prepay',v)} ariaLabel="선납금" />
            </div>
            <div className="quote-field">
              <label>보증금 <span className="help-tip" title="계약에 따라 만기 시 반환받을 수 있는 담보 성격의 금액">ⓘ</span></label>
              <ChoicePills items={[0,10,20,30].map((v) => ({value:v as Choice['deposit'],label:`${v}%`}))}
                selected={s.deposit} onPick={(v) => s.setChoice('deposit',v)} ariaLabel="보증금" />
            </div>
          </div>
          <div className="quote-result">
            <div className="quote-result-top"><span>예상 월 렌트료</span><span className="demo-tag">시세 참고가</span></div>
            <div className="quote-price"><strong>{money(q.amount)}</strong><span>원 / 월</span></div>
            <p>2026.11.02 공개 렌터사 비교 요율(연 2만km)을 기준으로 계산한 참고용 예상금액입니다. 주행거리와 중간 선납·보증 비율은 추정 보정값이며, 실제 견적과 다를 수 있습니다.</p>
          </div>
          <button className="btn btn-gold quote-submit" onClick={onConsult}>선택한 조건으로 무료 상담 신청 <ArrowUpRight size={19}/></button>
          <div className="quote-smallprint"><ShieldCheck size={14}/> 상담은 무료입니다. 무제한 주행거리, 선납·보증 동시 적용 여부와 확정 렌트료는 상담 시 확인됩니다.</div>
        </div>
      </div>
    </div>
  </section>;
}

const benefits = [
  { icon: <WalletCards size={28} strokeWidth={1.4}/>, num: '01', title: '초기 비용 부담 줄이기', desc: '차량 구매 시 필요한 목돈 부담을 줄일 수 있습니다. 선납금과 보증금 조건도 상황에 맞게 선택할 수 있습니다.' },
  { icon: <ShieldCheck size={28} strokeWidth={1.4}/>, num: '02', title: '보험료·자동차세까지 한 번에', desc: '보험료와 자동차세 등 주요 비용이 반영된 월 렌트료로 매달 지출할 차량 비용을 예상하기 쉽습니다.' },
  { icon: <Clock3 size={28} strokeWidth={1.4}/>, num: '03', title: '계약기간과 주행거리 선택', desc: '계약기간과 연간 주행거리를 직접 선택하고, 내 운행 습관에 맞는 월 렌트료를 비교할 수 있습니다.' },
  { icon: <ArrowLeftRight size={28} strokeWidth={1.4}/>, num: '04', title: '계약 종료 후 인수 또는 반납', desc: '계약이 끝나면 차량 인수와 반납 조건을 비교할 수 있습니다. 선택 가능 여부는 계약 상품에 따라 달라집니다.' },
];

function Benefits() {
  return <section className="benefits-section section-pad" id="benefits">
    <div className="shell">
      <div className="benefits-heading reveal">
        <div><Eyebrow>RENTAL BENEFITS</Eyebrow><h2>그랜저의 품격은 그대로,<br/><span>이용의 부담은 더 가볍게.</span></h2></div>
        <p>차량 준비부터 계약 종료까지, 장기렌트의 주요 장점 네 가지를 쉽게 확인해 보세요.</p>
      </div>
      <div className="benefits-grid">
        {benefits.map((b) => <article className="benefit-card reveal" key={b.num}>
          <div className="benefit-icon">{b.icon}</div><span className="benefit-number">{b.num} / 04</span>
          <h3>{b.title}</h3><p>{b.desc}</p>
        </article>)}
      </div>
      <p className="benefits-footnote">* 비용 포함 범위, 정비 서비스 및 만기 인수·반납 가능 여부는 렌트사와 계약 상품에 따라 달라집니다.</p>
    </div>
  </section>;
}

const faqs = [
  ['화면의 예상 월 렌트료가 최종 금액인가요?', '아니요. 화면에 표시된 금액은 선택한 조건을 기준으로 계산한 참고용 예상금액입니다. 실제 월 렌트료는 차량 사양, 렌터사 요율, 보험 조건 및 심사 결과에 따라 달라질 수 있습니다.'],
  ['월 렌트료에 보험료와 자동차세가 포함되나요?', '장기렌트 월 렌트료에는 일반적으로 자동차세와 보험료 등이 포함됩니다. 정비 서비스 포함 여부와 사고 시 자기부담금 등은 계약 상품에 따라 다르므로 최종 견적서에서 확인해 주세요.'],
  ['선납금과 보증금은 어떻게 다른가요?', '선납금은 월 렌트료 일부를 미리 납부하는 금액으로, 계약 종료 시 돌려받지 않습니다. 보증금은 계약 조건에 따라 종료 시 반환되거나 차량 인수금과 정산할 수 있습니다.'],
  ['선납금과 보증금 없이도 계약할 수 있나요?', '무선납·무보증 조건으로 견적 상담을 신청할 수 있습니다. 다만 실제 계약 가능 여부는 렌터사 심사 결과와 상품 조건에 따라 달라집니다.'],
  ['계약기간과 주행거리는 어떻게 선택하나요?', '현재 사이트에서는 36·48·60개월과 연간 1만·1만5천·2만·3만km 또는 무제한 조건을 비교할 수 있습니다. 실제 선택 가능한 조건은 렌터사와 상품에 따라 다를 수 있습니다.'],
  ['약정 주행거리를 초과하면 추가 비용이 있나요?', '약정한 주행거리를 초과하면 추가 비용이 발생할 수 있습니다. 초과 주행거리의 요금 기준과 km당 금액은 렌터사 및 계약 상품에 따라 달라집니다.'],
  ['계약이 끝나면 차량을 인수하거나 반납할 수 있나요?', '상품에 따라 계약 종료 후 차량을 인수하거나 반납할 수 있습니다. 인수 금액과 반납 조건은 계약 상품마다 다르므로 계약 전에 확인하는 것이 좋습니다.'],
  ['계약 중 해지하면 위약금이 발생하나요?', '계약기간 중 해지하면 중도해지 수수료가 발생할 수 있습니다. 정확한 금액과 계산 방식은 남은 계약기간과 약정 조건에 따라 달라집니다.'],
];

function Faq() {
  const [active, setActive] = useState<number | null>(0);
  return <section className="faq-section section-pad" id="faq">
    <div className="shell faq-layout">
      <div className="faq-intro reveal"><Eyebrow>FREQUENTLY ASKED</Eyebrow><h2>계약 전,<br/><span>꼭 확인해 보세요.</span></h2><p>예상 월 렌트료부터 계약 종료까지, 자주 묻는 질문을 정리했습니다.</p></div>
      <div className="faq-list">
        {faqs.map(([question,answer],i) => <div className={'faq-item ' + (active===i?'open':'')} key={question}>
          <button type="button" id={`faq-question-${i}`} aria-expanded={active===i} aria-controls={`faq-answer-${i}`} onClick={() => setActive(active===i?null:i)}>
            <span className="faq-index">0{i+1}</span><span>{question}</span><ChevronDown size={20}/>
          </button>
          <div className="faq-answer" id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} aria-hidden={active!==i}>
            <div className="faq-answer-inner"><p>{answer}</p></div>
          </div>
        </div>)}
      </div>
    </div>
  </section>;
}

function CtaBanner({ onConsult }: { onConsult: () => void }) {
  return <section className="cta-section">
    <div className="cta-backdrop" style={{ backgroundImage: 'url("/images/grandeur-city.webp")' }} />
    <div className="shell cta-content reveal">
      <Eyebrow light>GRANDEUR / FREE CONSULTATION</Eyebrow>
      <h2>그랜저 장기렌트,<br/><em>조건에 맞춰</em><br/>견적을 받아보세요.</h2>
      <p>선택하신 트림·컬러·이용 조건으로 무료 견적 상담을 신청하실 수 있습니다.</p>
      <button className="btn btn-gold" onClick={onConsult}>무료 견적 상담 신청 <ArrowUpRight size={19}/></button>
    </div>
  </section>;
}

function Footer() {
  return <footer className="footer">
    <div className="shell">
      <div className="footer-top"><div className="footer-brand"><b>FITCARCOMPANY<span> |</span></b></div><a href="#top" aria-label="상단으로 이동">BACK TO TOP ↑</a></div>
      <div className="footer-business" aria-label="사업자 정보">
        <div className="footer-business-item"><span>상호명</span><strong>핏카컴퍼니</strong></div>
        <div className="footer-business-item"><span>대표자</span><strong>김민철</strong></div>
        <div className="footer-business-item"><span>사업자등록번호</span><strong>578-36-01253</strong></div>
        <div className="footer-business-item"><span>주소</span><strong>인천 서구 파랑로 495 에이스하이테크시티 1동 1004호</strong></div>
      </div>
      <p className="footer-image-credit">차량 이미지 출처: 현대자동차 공식 제공 이미지</p>
    </div>
  </footer>;
}

function ConsultationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const choice = useChoice();
  const quote = useMemo(() => simulateQuote(choice), [choice.engine,choice.trim,choice.color,choice.months,choice.mileage,choice.prepay,choice.deposit]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneValid = /^01\d{8,9}$/.test(phone.replace(/\D/g, ''));
  const nameRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    const id = window.setTimeout(() => nameRef.current?.focus(), 20);
    return () => { document.body.style.overflow = ''; clearTimeout(id); previousFocus.current?.focus(); };
  }, [open]);
  if (!open) return null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key !== 'Tab') return;
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),a[href]') ?? [];
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !phoneValid || !consent) {
      setPhoneTouched(true);
      setNotice('고객명, 올바른 연락처, 개인정보 동의 항목을 확인해주세요.'); return;
    }
    const selection: Choice = {
      engine: choice.engine, trim: choice.trim, color: choice.color, months: choice.months,
      mileage: choice.mileage, prepay: choice.prepay, deposit: choice.deposit,
    };
    setSubmitting(true);
    setNotice('');
    try {
      const result = await submitLead({
        name: name.trim(), phone: phone.trim(), note: note.trim(), selection, quote,
        privacyConsent: consent, createdAt: new Date().toISOString(),
      });
      setNotice(result === 'sent'
        ? '견적 상담 신청이 접수되었습니다.'
        : '현재는 개발 시안입니다. 입력하신 정보가 저장되거나 전송되지 않았습니다. 실제 상담 접수는 API 연결 후 제공됩니다.');
    } catch {
      setNotice('상담 신청을 전송하지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="consult-title" className="consult-dialog" ref={dialogRef} onKeyDown={onKeyDown}>
      <div className="modal-header"><div><span className="mini-label">FITCAR COMPANY / CONSULTATION</span><h2 id="consult-title">그랜저 무료 견적 상담</h2><p>선택하신 조건을 확인하고 문의 내용을 남겨주세요.</p></div><button className="modal-close" aria-label="팝업 닫기" onClick={onClose}><X size={22}/></button></div>
      <div className="modal-scroll" data-lenis-prevent>
        <div className="modal-quote">
          <div className="modal-quote-title"><b>THE NEW GRANDEUR</b><span>선택 조건 자동 반영 <Check size={13}/></span></div>
          <p>{engineNames[choice.engine]} · {trimNames[choice.trim]} · {vehiclePhotos[choice.color].name}</p>
          <p>{choice.months}개월 · 연 {mileageLabel(choice.mileage)} · 선납 {choice.prepay}% · 보증 {choice.deposit}%</p>
          <div className="modal-quote-price"><span>예상 월 렌트료 <small>(참고용 예상금액)</small></span><strong>{money(quote.amount)}원</strong></div>
          <p className="modal-price-note">실제 월 렌트료는 렌터사 및 계약 조건에 따라 달라질 수 있습니다.</p>
        </div>
        <form onSubmit={submit} className="consult-form">
          <div className="modal-form-row"><label htmlFor="lead-name">고객명 <b>*</b></label><input id="lead-name" ref={nameRef} value={name} onChange={(e)=>setName(e.target.value)} maxLength={30} placeholder="성함을 입력해주세요" required /></div>
          <div className="modal-form-row"><label htmlFor="lead-phone">연락처 <b>*</b></label><input id="lead-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e)=>{setPhone(e.target.value);setNotice('');}} onBlur={()=>setPhoneTouched(true)} aria-invalid={phoneTouched && !phoneValid} aria-describedby={phoneTouched && !phoneValid ? 'lead-phone-error' : undefined} maxLength={15} placeholder="010-0000-0000" required />{phoneTouched && !phoneValid && <p className="field-error" id="lead-phone-error">휴대전화 번호를 확인해주세요. (예: 010-1234-5678)</p>}</div>
          <div className="modal-form-row"><label htmlFor="lead-note">추가 문의사항 <span>(선택)</span></label><textarea id="lead-note" value={note} onChange={(e)=>setNote(e.target.value)} maxLength={500} placeholder="희망 출고 시기 등 궁금하신 내용을 작성해주세요." rows={3}/></div>
          <div className="privacy-area"><label className="consent-label"><input type="checkbox" checked={consent} onChange={(e)=>setConsent(e.target.checked)}/><span><b>[필수]</b> 개인정보 수집 및 이용 동의</span></label><button type="button" className="privacy-toggle" aria-expanded={showConsent} onClick={()=>setShowConsent(!showConsent)}>내용 보기 <ChevronDown size={14}/></button></div>
          {showConsent && <div className="privacy-detail">수집항목: 고객명, 연락처, 추가 문의사항, 선택 견적 조건<br/>수집목적: 장기렌트 견적 상담 요청에 대한 연락 및 응대<br/>보유·이용 기간 및 동의 거부 시 안내: 실제 운영사의 개인정보처리방침 확정 후 고지합니다. 현재 시안은 정보를 저장하지 않습니다.</div>}
          {notice && <p className="submit-notice" role="status">{notice}</p>}
          <button type="submit" className="btn btn-gold modal-submit" disabled={submitting}>{submitting ? '전송 중...' : '무료 견적 상담 신청하기'} <ArrowUpRight size={17}/></button>
        </form>
      </div>
    </div>
  </div>;
}

export default function App() {
  const main = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [consultOpen, setConsultOpen] = useState(false);
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      anchors: true,
      respectReducedMotion: true,
    });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();
    return () => {
      gsap.ticker.remove(update);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (consultOpen) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [consultOpen]);
  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target);
    } else {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo('.hero-copy .eyebrow, .hero-copy h1, .hero-copy p, .hero-buttons',
      { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .95, stagger: .13, delay: .2, ease: 'power3.out' });
    gsap.fromTo('.hero-visual', { scale: 1.055 }, { scale: 1, duration: 2, ease: 'power2.out' });
    gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
      gsap.fromTo(el,{ y: 35, opacity: 0 }, {
        y: 0, opacity: 1, duration: .88, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }, { scope: main });
  return <main ref={main}>
    <Header onConsult={() => setConsultOpen(true)} onNavigate={scrollToSection} />
    <Hero onConsult={() => setConsultOpen(true)} />
    <IntroDesign />
    <ColorEstimate onConsult={() => setConsultOpen(true)} />
    <Benefits />
    <Faq />
    <CtaBanner onConsult={() => setConsultOpen(true)} />
    <Footer />
    <div className="mobile-fixed-cta"><button onClick={() => setConsultOpen(true)}>무료 견적 상담 <ArrowUpRight size={17}/></button></div>
    <ConsultationDialog open={consultOpen} onClose={() => setConsultOpen(false)} />
  </main>;
}
