/**
 * Re:Connect - Alumni Reunion Mobile Invitation Application
 * Fully responsive, interactive & elegant
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initPetalCanvas();
  initPhotoSlider();
  initCountdownTimer();
  initMapView();
  initBgmSynth();
  initRsvpAndGuestbook();
  initSharingAndClipboard();
});

/* ==========================================================================
   1. Scroll Reveal Animation (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
  
  // Hero section is instantly visible
  const hero = document.getElementById('heroSection');
  if (hero) hero.classList.add('active');
}

/* ==========================================================================
   2. [사진 섹션] 부드러운 슬라이드 애니메이션 & 터치 제스처
   ========================================================================== */
function initPhotoSlider() {
  const slides = document.querySelectorAll('.slide-item');
  const dots = document.querySelectorAll('.slider-indicators .dot');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const captionEl = document.getElementById('slideCaption');
  const counterEl = document.getElementById('slideCounter');
  const progressFill = document.getElementById('slideProgressFill');
  const sliderContainer = document.getElementById('photoSlider');

  if (!slides.length) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  const slideDuration = 4500; // 4.5초마다 부드럽게 전환
  let slideTimer = null;
  let progressTimer = null;
  let progressStartTime = 0;

  function showSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    const activeSlide = slides[index];
    const caption = activeSlide.getAttribute('data-caption') || '';
    if (captionEl) {
      captionEl.style.opacity = '0';
      setTimeout(() => {
        captionEl.textContent = caption;
        captionEl.style.opacity = '1';
      }, 200);
    }

    if (counterEl) {
      counterEl.textContent = `${index + 1} / ${totalSlides}`;
    }

    currentIndex = index;
    resetProgress();
  }

  function resetProgress() {
    if (progressTimer) cancelAnimationFrame(progressTimer);
    if (progressFill) progressFill.style.width = '0%';
    progressStartTime = performance.now();

    function updateProgress(now) {
      const elapsed = now - progressStartTime;
      const progress = Math.min((elapsed / slideDuration) * 100, 100);
      if (progressFill) progressFill.style.width = `${progress}%`;

      if (elapsed < slideDuration) {
        progressTimer = requestAnimationFrame(updateProgress);
      }
    }
    progressTimer = requestAnimationFrame(updateProgress);
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    slideTimer = setInterval(nextSlide, slideDuration);
    resetProgress();
  }

  function stopAutoPlay() {
    if (slideTimer) clearInterval(slideTimer);
    if (progressTimer) cancelAnimationFrame(progressTimer);
    if (progressFill) progressFill.style.width = '0%';
  }

  // Click controls
  if (nextBtn) nextBtn.addEventListener('click', () => {
    nextSlide();
    startAutoPlay();
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    prevSlide();
    startAutoPlay();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.getAttribute('data-slide'), 10);
      showSlide(targetIndex);
      startAutoPlay();
    });
  });

  // Touch Swipe for Smartphones
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  sliderContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    stopAutoPlay();
  }, { passive: true });

  sliderContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
    startAutoPlay();
  }, { passive: true });

  // Mouse Drag Support
  let isMouseDown = false;
  let mouseStartX = 0;

  sliderContainer.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseStartX = e.clientX;
    stopAutoPlay();
  });

  window.addEventListener('mouseup', (e) => {
    if (!isMouseDown) return;
    isMouseDown = false;
    const diff = e.clientX - mouseStartX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) prevSlide();
      else nextSlide();
    }
    startAutoPlay();
  });

  function handleGesture() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    // Horizontal swipe threshold
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  }

  // Hover pause
  sliderContainer.addEventListener('mouseenter', stopAutoPlay);
  sliderContainer.addEventListener('mouseleave', startAutoPlay);

  // Initialize first slide
  showSlide(0);
  startAutoPlay();
}

/* ==========================================================================
   3. [카운트다운 섹션] 실시간 카운트다운 애니메이션
   ========================================================================== */
function initCountdownTimer() {
  // 행사 일시: 2032년 10월 1일 17:00:00 KST
  const targetDate = new Date('2032-10-01T17:00:00+09:00').getTime();

  const daysEl = document.getElementById('countDays');
  const hoursEl = document.getElementById('countHours');
  const minutesEl = document.getElementById('countMinutes');
  const secondsEl = document.getElementById('countSeconds');
  const ddayEl = document.getElementById('ddayNumber');
  const submessageEl = document.getElementById('countdownSubmessage');

  let prevSec = -1;

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      if (ddayEl) ddayEl.textContent = 'DAY';
      if (submessageEl) submessageEl.textContent = '🎉 오늘이 바로 Re:Connect 동창회 날입니다! 환영합니다! 🎉';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (ddayEl) ddayEl.textContent = days.toString();
    if (daysEl) daysEl.textContent = String(days);
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');

    if (secondsEl) {
      const secStr = String(seconds).padStart(2, '0');
      if (seconds !== prevSec) {
        secondsEl.textContent = secStr;
        secondsEl.parentElement.classList.remove('pulse');
        // Trigger small bounce animation
        void secondsEl.parentElement.offsetWidth;
        secondsEl.parentElement.classList.add('pulse');
        prevSec = seconds;
      }
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 구글 캘린더 등록 연동
  const googleCalBtn = document.getElementById('addGoogleCalendarBtn');
  if (googleCalBtn) {
    googleCalBtn.addEventListener('click', () => {
      const title = encodeURIComponent('Re:Connect 동창회');
      const details = encodeURIComponent('세월이 흘러도 변하지 않는 우리들의 이야기, Re:Connect 동창회\n장소: 창경궁\n네이버 지도: https://naver.me/FFGMk3uS');
      const location = encodeURIComponent('서울특별시 종로구 창경궁로 185 창경궁');
      // 20321001T170000 / 20321001T210000 (KST is UTC+9 => 20321001T080000Z / 20321001T120000Z)
      const dates = '20321001T080000Z/20321001T120000Z';
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(gcalUrl, '_blank');
      showToast('구글 캘린더 등록 창이 열렸습니다 🗓️');
    });
  }

  // iCal (.ics) 스마트폰 다운로드 연동
  const downloadIcsBtn = document.getElementById('downloadIcsBtn');
  if (downloadIcsBtn) {
    downloadIcsBtn.addEventListener('click', () => {
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ReConnect//Alumni Reunion//KO',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'SUMMARY:Re:Connect 동창회',
        'DESCRIPTION:세월이 흘러도 변하지 않는 우리들의 이야기\\n창경궁에서 만나요!\\nhttps://naver.me/FFGMk3uS',
        'LOCATION:서울특별시 종로구 창경궁로 185 창경궁',
        'DTSTART:20321001T080000Z',
        'DTEND:20321001T120000Z',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'ReConnect_동창회.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('캘린더 파일(.ics)이 다운로드되었습니다 📥');
    });
  }
}

/* ==========================================================================
   4. [지도 섹션] 300x300 픽셀 창경궁 지도 렌더링
   ========================================================================== */
function initMapView() {
  const mapElement = document.getElementById('interactiveMap');
  if (!mapElement) return;

  // 창경궁 중심 좌표 (위도: 37.5796, 경도: 126.9948)
  const changgyeonggung = [37.5796, 126.9948];

  try {
    if (typeof L !== 'undefined') {
      const map = L.map('interactiveMap', {
        center: changgyeonggung,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // OpenStreetMap 타일 레이어 추가
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      // 커스텀 줌 컨트롤 (우하단)
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // 커스텀 마커 생성
      const customIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: '<div class="marker-pin"></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker(changgyeonggung, { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: Pretendard, sans-serif; text-align: center; padding: 4px;">
          <strong style="color: #183327; font-size: 13px;">창경궁 (동창회 장소)</strong><br>
          <span style="font-size: 11px; color: #666;">2032.10.1 (토) 오후 5시</span><br>
          <a href="https://naver.me/FFGMk3uS" target="_blank" style="display:inline-block; margin-top:4px; font-size:11px; color:#03c75a; font-weight:bold; text-decoration:none;">네이버 지도로 보기 ↗</a>
        </div>
      `).openPopup();

      // 화면 리사이즈 시 300x300 사이즈 보정
      setTimeout(() => {
        map.invalidateSize();
      }, 400);
    } else {
      showFallbackMap(mapElement);
    }
  } catch (e) {
    console.warn('Map initialization fallback triggered:', e);
    showFallbackMap(mapElement);
  }

  // 주소 복사 버튼
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      const address = document.getElementById('venueAddress')?.textContent || '서울특별시 종로구 창경궁로 185';
      copyToClipboard(address, '창경궁 주소가 복사되었습니다 📋');
    });
  }
}

// 오프라인이거나 CDN 실패 시 표시되는 고품질 300x300 정적 지도 뷰
function showFallbackMap(container) {
  container.innerHTML = `
    <div style="width:100%; height:100%; background: #e9ecef; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:16px; position:relative;">
      <div style="font-size:36px; margin-bottom:8px;">🏛️</div>
      <strong style="font-size:15px; color:#183327;">창경궁 (홍화문)</strong>
      <p style="font-size:12px; color:#666; margin-top:4px;">서울 종로구 창경궁로 185</p>
      <a href="https://naver.me/FFGMk3uS" target="_blank" style="margin-top:10px; font-size:12px; background:#03c75a; color:white; padding:6px 12px; border-radius:6px; text-decoration:none; font-weight:600;">
        네이버 지도로 확인 ↗
      </a>
    </div>
  `;
}

/* ==========================================================================
   5. BGM Web Audio Synth (잔잔하고 감성적인 피아노 아르페지오 멜로디)
   ========================================================================== */
function initBgmSynth() {
  const bgmToggleBtn = document.getElementById('bgmToggleBtn');
  const bgmIcon = document.getElementById('bgmIcon');
  const bgmLabel = document.getElementById('bgmLabel');
  
  if (!bgmToggleBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let intervalId = null;

  // 감성적인 아르페지오 음계 (C Major / A Minor 펜타토닉 기반)
  const notes = [
    261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
    220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
    174.61, 220.00, 261.63, 349.23, // F3, A3, C4, F4
    196.00, 246.94, 293.66, 392.00  // G3, B3, D4, G4
  ];

  let noteIndex = 0;

  function playNote(freq) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // 잔잔하고 부드러운 엠비언트 엔벨로프
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.3);
    } catch (e) {
      console.warn('Synth error:', e);
    }
  }

  function startMusic() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = true;
    bgmIcon.classList.add('playing');
    bgmLabel.textContent = 'ON';
    showToast('감성 BGM이 재생됩니다 🎶');

    intervalId = setInterval(() => {
      playNote(notes[noteIndex]);
      noteIndex = (noteIndex + 1) % notes.length;
    }, 450);
  }

  function stopMusic() {
    isPlaying = false;
    bgmIcon.classList.remove('playing');
    bgmLabel.textContent = 'BGM';
    if (intervalId) clearInterval(intervalId);
    showToast('BGM이 일시정지되었습니다 🔇');
  }

  bgmToggleBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });
}

/* ==========================================================================
   6. 감성 벚꽃/추억의 꽃잎 파티클 애니메이션
   ========================================================================== */
function initPetalCanvas() {
  const canvas = document.getElementById('petalCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const petalCount = Math.min(Math.floor(width / 35), 24);

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 0.9 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 1.5;
      this.opacity = Math.random() * 0.4 + 0.25;
      // Soft petal & warm gold shades
      const colors = ['rgba(255, 220, 225, ', 'rgba(235, 205, 130, ', 'rgba(245, 240, 230, '];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.015) * 0.6 + this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = `${this.colorBase}${this.opacity})`;
      ctx.beginPath();
      // Draw smooth petal shape
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size, -this.size / 2, this.size, this.size / 2, 0, this.size);
      ctx.bezierCurveTo(-this.size, this.size / 2, -this.size, -this.size / 2, 0, -this.size);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   7. 참석 응답(RSVP) 및 방명록 저장/렌더링
   ========================================================================== */
function initRsvpAndGuestbook() {
  const form = document.getElementById('rsvpForm');
  const guestbookList = document.getElementById('guestbookList');
  const guestCountEl = document.getElementById('guestCount');

  // 로컬스토리지에서 기존 작성글 불러오기
  const STORAGE_KEY = 'reconnect_guestbook_entries';
  let guestEntries = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      guestEntries = JSON.parse(saved);
    }
  } catch (e) {
    console.warn(e);
  }

  function updateGuestCount() {
    if (guestCountEl) {
      guestCountEl.textContent = String(2 + guestEntries.length);
    }
  }

  function renderSavedEntries() {
    if (!guestbookList) return;
    // Keep initial 2 default cards, append user cards on top
    guestEntries.forEach(entry => {
      addCardToDOM(entry, false);
    });
    updateGuestCount();
  }

  function addCardToDOM(entry, prepend = true) {
    const card = document.createElement('div');
    card.className = 'guest-card';
    const isAttend = entry.attendance === 'attend';

    card.innerHTML = `
      <div class="guest-info">
        <span class="guest-avatar">${isAttend ? '🌸' : '🌿'}</span>
        <strong class="guest-author">${escapeHTML(entry.name)}</strong>
        <span class="guest-status ${isAttend ? 'attend' : 'undecided'}">
          ${isAttend ? '참석 확정' : '고려 중'}
        </span>
      </div>
      <p class="guest-text">${escapeHTML(entry.message || '참석 응답을 남겼습니다.')}</p>
      <span class="guest-time">${entry.date || '방금 전'}</span>
    `;

    if (prepend && guestbookList.firstChild) {
      guestbookList.insertBefore(card, guestbookList.firstChild);
    } else {
      guestbookList.appendChild(card);
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('guestName')?.value.trim();
      const attendance = form.querySelector('input[name="attendance"]:checked')?.value || 'attend';
      const message = document.getElementById('guestMessage')?.value.trim();

      if (!name) return;

      const newEntry = {
        name,
        attendance,
        message,
        date: '방금 전'
      };

      guestEntries.unshift(newEntry);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(guestEntries));
      } catch (err) {}

      addCardToDOM(newEntry, true);
      updateGuestCount();
      form.reset();

      showToast(`🎉 ${name}님, 참석 응답이 등록되었습니다!`);
    });
  }

  renderSavedEntries();
}

/* ==========================================================================
   8. 공유하기 및 클립보드 복사 토스트
   ========================================================================== */
function initSharingAndClipboard() {
  const quickShareBtn = document.getElementById('quickShareBtn');
  const footerShareBtn = document.getElementById('footerShareBtn');

  function handleShare() {
    const shareData = {
      title: 'Re:Connect - 동창회 초대장',
      text: '세월이 흘러도 변하지 않는 우리들의 이야기, 2032.10.1 (토) 창경궁에서 만나요!',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        copyToClipboard(window.location.href, '초대장 주소가 복사되었습니다 💌');
      });
    } else {
      copyToClipboard(window.location.href, '초대장 주소가 복사되었습니다 💌');
    }
  }

  if (quickShareBtn) quickShareBtn.addEventListener('click', handleShare);
  if (footerShareBtn) footerShareBtn.addEventListener('click', handleShare);
}

function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    showToast('주소를 직접 복사해주세요.');
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
