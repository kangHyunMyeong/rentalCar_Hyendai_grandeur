import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

type GalleryPhoto = {
  src: string;
  alt: string;
  label: string;
  title: string;
  position?: string;
};

type GalleryPanel =
  | { kind: 'wide'; key: string; photo: GalleryPhoto }
  | { kind: 'stack'; key: string; photos: [GalleryPhoto, GalleryPhoto] };

const exterior: GalleryPhoto = {
  src: '/images/grandeur-exterior.webp',
  alt: '높은 곳에서 바라본 실버 그랜저의 차체와 루프 라인',
  label: 'EXTERIOR DESIGN',
  title: '정제된 차체 라인과 균형 잡힌 비율.',
  position: 'center',
};

const cockpit: GalleryPhoto = {
  src: '/images/grandeur-interior-dashboard.webp',
  alt: '그랜저의 운전석, 대시보드와 중앙 디스플레이',
  label: 'COCKPIT',
  title: '운전자 중심의 공간',
  position: '52% center',
};

const cabin: GalleryPhoto = {
  src: '/images/grandeur-interior-cabin.webp',
  alt: '그랜저 실내 시트와 센터 콘솔',
  label: 'INTERIOR',
  title: '여유로운 실내 디자인',
  position: '56% center',
};

const silhouette: GalleryPhoto = {
  src: '/images/grandeur-silhouette.webp',
  alt: '건축물 앞에 선 실버와 블랙 색상의 그랜저 두 대',
  label: 'DESIGN PRESENCE',
  title: '어느 각도에서나 느껴지는 존재감.',
  position: 'center',
};

const architecture: GalleryPhoto = {
  src: '/images/grandeur-hero.webp',
  alt: '대리석 건축물 앞의 버건디 그랜저',
  label: 'GRANDEUR',
  title: '건축과 어우러지는 디자인',
  position: 'center',
};

const city: GalleryPhoto = {
  src: '/images/grandeur-city.webp',
  alt: '도시를 배경으로 서 있는 버건디 그랜저',
  label: 'GRANDEUR',
  title: '일상 속 그랜저의 존재감',
  position: 'center',
};

const desktopPanels: GalleryPanel[] = [
  { kind: 'wide', key: 'exterior', photo: exterior },
  { kind: 'stack', key: 'interior', photos: [cockpit, cabin] },
  { kind: 'wide', key: 'silhouette', photo: silhouette },
  { kind: 'stack', key: 'presence', photos: [architecture, city] },
];

const mobilePhotos = [exterior, cockpit, cabin, silhouette, architecture, city];

function GalleryFrame({ photo, small = false }: { photo: GalleryPhoto; small?: boolean }) {
  return <figure className={'gallery-frame ' + (small ? 'gallery-frame-small' : '')}>
    <img src={photo.src} alt={photo.alt} loading="lazy"
      style={photo.position ? { objectPosition: photo.position } : undefined} />
    <div className="gallery-image-shade" aria-hidden="true" />
    <figcaption className="gallery-frame-caption">
      <span>{photo.label}</span>
      <h3>{photo.title}</h3>
    </figcaption>
  </figure>;
}

function GalleryTrack({ mobile }: { mobile: boolean }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [atBeginning, setAtBeginning] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const total = mobile ? mobilePhotos.length : desktopPanels.length;

  const syncSwiper = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
    setAtBeginning(swiper.isBeginning);
    setAtEnd(swiper.isEnd);
  };

  return <div className="design-gallery" role="region" aria-label="그랜저 디자인 이미지 갤러리">
    <Swiper
      className={'design-swiper ' + (mobile ? 'is-mobile' : 'is-desktop')}
      modules={[A11y, Keyboard]}
      slidesPerView="auto"
      spaceBetween={mobile ? 12 : 18}
      slidesOffsetAfter={mobile ? 20 : 80}
      grabCursor
      speed={650}
      keyboard={{ enabled: true, onlyInViewport: true }}
      a11y={{ enabled: true }}
      observer
      observeParents
      onSwiper={(swiper) => { swiperRef.current = swiper; syncSwiper(swiper); }}
      onSlideChange={syncSwiper}
      onReachEnd={syncSwiper}
      onFromEdge={syncSwiper}
      onResize={syncSwiper}
    >
      {mobile ? mobilePhotos.map((photo) => <SwiperSlide className="gallery-slide gallery-slide-mobile" key={photo.src}>
        <GalleryFrame photo={photo} />
      </SwiperSlide>) : desktopPanels.map((panel) => <SwiperSlide
        className={'gallery-slide gallery-slide-' + panel.kind} key={panel.key}>
        {panel.kind === 'wide'
          ? <GalleryFrame photo={panel.photo} />
          : <div className="gallery-photo-stack">
            {panel.photos.map((photo) => <GalleryFrame key={photo.src} photo={photo} small />)}
          </div>}
      </SwiperSlide>)}
    </Swiper>

    <div className="gallery-toolbar">
      <span className="gallery-position" aria-live="polite">
        <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
        <span> / {String(total).padStart(2, '0')}</span>
      </span>
      <button type="button" aria-label="이전 디자인 이미지" disabled={atBeginning}
        onClick={() => swiperRef.current?.slidePrev()}><ArrowLeft size={19} aria-hidden="true" /></button>
      <div className="gallery-progress" aria-hidden="true">
        <span style={{ width: `${((activeIndex + 1) / total) * 100}%` }} />
      </div>
      <button type="button" aria-label="다음 디자인 이미지" disabled={atEnd}
        onClick={() => swiperRef.current?.slideNext()}><ArrowRight size={19} aria-hidden="true" /></button>
    </div>
  </div>;
}

export function DesignGallery() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const onChange = () => setMobile(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return <GalleryTrack key={mobile ? 'mobile' : 'desktop'} mobile={mobile} />;
}
