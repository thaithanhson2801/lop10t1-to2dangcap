/**
 * ===================================================================
 * 20/10 YÊU THƯƠNG - GỬI PHÁI ĐẸP LỚP 10T1 | TỔ 2 ĐẲNG CẤP
 * Core Interactivity, Lucky Wheel, Audio, Security & Admin Engine
 * Admin Password: Son2801@
 * ===================================================================
 */

(function () {
  'use strict';

  // --- Configuration & Constants ---
  const ADMIN_PASSWORD = 'Son2801@';
  const STORAGE_KEY_PLAYED = '10t1_2010_has_played_v1';
  const STORAGE_KEY_TICKET = '10t1_2010_my_ticket_v1';
  const STORAGE_KEY_SUBMISSIONS = '10t1_2010_submissions_v1';
  const STORAGE_KEY_DEVICE = '10t1_2010_device_uuid_v1';
  const STORAGE_KEY_STOCK = '10t1_2010_stock_v1';

  // Default Initial Stock
  const DEFAULT_STOCK = {
    candies: 5,    // Cục kẹo
    lollipops: 3   // Kẹo mút
  };

  // Wheel Sectors Definition
  // Each prize corresponds to user's stock: 2 cục kẹo, 1 cục kẹo, 2 cục kẹo mút (or 1 kẹo mút)
  const WHEEL_SECTORS = [
    {
      id: 'lolli_2',
      name: '2 Cây Kẹo Mút 🍭🍭',
      shortName: '2 KẸO MÚT',
      type: 'lollipop',
      amount: 2,
      desc: 'Giải Đặc Biệt! Bạn nhận được 2 cây kẹo mút siêu ngọt ngào từ Tổ 2!',
      color: '#e11d48',
      textColor: '#ffffff'
    },
    {
      id: 'candy_1_a',
      name: '1 Cục Kẹo Ngọt 🍬',
      shortName: '1 CỤC KẸO',
      type: 'candy',
      amount: 1,
      desc: 'Giải Ba! 1 viên kẹo ngọt gửi gắm lời chúc 20/10 luôn xinh xắn!',
      color: '#fbbf24',
      textColor: '#78350f'
    },
    {
      id: 'lolli_1_a',
      name: '1 Cây Kẹo Mút 🍭',
      shortName: '1 KẸO MÚT',
      type: 'lollipop',
      amount: 1,
      desc: 'Giải Nhất! 1 cây kẹo mút tròn vị ngọt lịm tặng bạn nữ dễ thương!',
      color: '#f43f5e',
      textColor: '#ffffff'
    },
    {
      id: 'candy_2_a',
      name: '2 Cục Kẹo Thơm 🍬🍬',
      shortName: '2 CỤC KẸO',
      type: 'candy',
      amount: 2,
      desc: 'Giải Nhì! Nhân đôi vị ngọt với 2 cục kẹo thơm lừng từ bạn Sơn và Tổ 2!',
      color: '#d97706',
      textColor: '#ffffff'
    },
    {
      id: 'candy_1_b',
      name: '1 Cục Kẹo Dễ Thương 🍬',
      shortName: '1 CỤC KẸO',
      type: 'candy',
      amount: 1,
      desc: 'Giải Ba! 1 cục kẹo may mắn mang lại nụ cười rạng rỡ cho bạn hôm nay!',
      color: '#fb7185',
      textColor: '#ffffff'
    },
    {
      id: 'lolli_1_b',
      name: '1 Cây Kẹo Mút Yêu Thương 🍭',
      shortName: '1 KẸO MÚT',
      type: 'lollipop',
      amount: 1,
      desc: 'Giải Nhất! Kẹo mút xinh xắn dành riêng cho một bông hoa tươi thắm của 10T1!',
      color: '#be123c',
      textColor: '#ffffff'
    },
    {
      id: 'candy_2_b',
      name: '2 Cục Kẹo Năng Lượng 🍬🍬',
      shortName: '2 CỤC KẸO',
      type: 'candy',
      amount: 2,
      desc: 'Giải Nhì! 2 cục kẹo tiếp thêm động lực học giỏi và đạt điểm 10 rực rỡ!',
      color: '#f59e0b',
      textColor: '#78350f'
    },
    {
      id: 'candy_1_c',
      name: '1 Cục Kẹo May Mắn 🍬',
      shortName: '1 CỤC KẸO',
      type: 'candy',
      amount: 1,
      desc: 'Giải Ba! May mắn gõ cửa với 1 viên kẹo ngọt ngào từ các bạn nam 10T1!',
      color: '#f43f5e',
      textColor: '#ffffff'
    }
  ];

  // State Management
  let isEnvelopeOpened = false;
  let isSpinning = false;
  let currentWheelRotation = 0; // in radians
  let ytPlayer = null;
  let isMusicPlaying = false;
  let audioContext = null;

  // DOM Elements
  const envelopeScreen = document.getElementById('envelopeScreen');
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const waxSeal = document.getElementById('waxSeal');
  const btnOpenEnvelopeAction = document.getElementById('btnOpenEnvelopeAction');
  const mainContent = document.getElementById('mainContent');

  const musicPill = document.getElementById('musicPill');
  const musicWave = document.getElementById('musicWave');
  const musicStatusText = document.getElementById('musicStatusText');
  const musicIcon = document.getElementById('musicIcon');
  const toggleMusicBtn = document.getElementById('toggleMusicBtn');

  const wheelCanvas = document.getElementById('wheelCanvas');
  const wheelCtx = wheelCanvas ? wheelCanvas.getContext('2d') : null;
  const btnSpinWheel = document.getElementById('btnSpinWheel');
  const btnSpinAction = document.getElementById('btnSpinAction');
  const studentNameInput = document.getElementById('studentNameInput');
  const btnClearName = document.getElementById('btnClearName');

  const gamePlayArea = document.getElementById('gamePlayArea');
  const ticketResultArea = document.getElementById('ticketResultArea');
  const ticketStudentName = document.getElementById('ticketStudentName');
  const ticketPrizeName = document.getElementById('ticketPrizeName');
  const ticketPrizeDesc = document.getElementById('ticketPrizeDesc');
  const ticketVerifyCode = document.getElementById('ticketVerifyCode');
  const ticketPlayTime = document.getElementById('ticketPlayTime');
  const ticketDeviceShortId = document.getElementById('ticketDeviceShortId');

  const displayLollipopStock = document.getElementById('displayLollipopStock');
  const displayCandyStock = document.getElementById('displayCandyStock');

  // Admin Elements
  const openAdminModalBtn = document.getElementById('openAdminModalBtn');
  const footerAdminBtn = document.getElementById('footerAdminBtn');
  const adminModalBackdrop = document.getElementById('adminModalBackdrop');
  const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');
  const adminViewLogin = document.getElementById('adminViewLogin');
  const adminViewDashboard = document.getElementById('adminViewDashboard');
  const adminPassInput = document.getElementById('adminPassInput');
  const btnToggleEye = document.getElementById('btnToggleEye');
  const eyeIcon = document.getElementById('eyeIcon');
  const btnAdminLogin = document.getElementById('btnAdminLogin');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const btnAdminLogout = document.getElementById('btnAdminLogout');

  const verifyCodeInput = document.getElementById('verifyCodeInput');
  const btnVerifyCode = document.getElementById('btnVerifyCode');
  const verifyResultToast = document.getElementById('verifyResultToast');

  const dashTotalPlayers = document.getElementById('dashTotalPlayers');
  const dashCandyWon = document.getElementById('dashCandyWon');
  const dashLollipopWon = document.getElementById('dashLollipopWon');
  const claimsTableBody = document.getElementById('claimsTableBody');
  const btnResetCurrentDevice = document.getElementById('btnResetCurrentDevice');
  const btnResetAllData = document.getElementById('btnResetAllData');
  const btnExportJSON = document.getElementById('btnExportJSON');

  // ===================================================================
  // 1. INITIALIZATION & DEVICE FINGERPRINT
  // ===================================================================

  function getOrCreateDeviceId() {
    let id = localStorage.getItem(STORAGE_KEY_DEVICE);
    if (!id) {
      id = 'DEV-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now().toString().slice(-4);
      localStorage.setItem(STORAGE_KEY_DEVICE, id);
    }
    return id;
  }

  function getSubmissions() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveSubmissions(list) {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(list));
  }

  function getStock() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STOCK);
      return data ? JSON.parse(data) : { ...DEFAULT_STOCK };
    } catch (e) {
      return { ...DEFAULT_STOCK };
    }
  }

  function saveStock(stock) {
    localStorage.setItem(STORAGE_KEY_STOCK, JSON.stringify(stock));
  }

  function updateStockDisplay() {
    const stock = getStock();
    if (displayLollipopStock) displayLollipopStock.textContent = Math.max(0, stock.lollipops);
    if (displayCandyStock) displayCandyStock.textContent = Math.max(0, stock.candies);
  }

  // ===================================================================
  // 2. WEB AUDIO API SYNTHESIZER (TICK & FANFARE SOUNDS)
  // ===================================================================

  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  // Realistic Wheel Ticker Sound
  function playTickSound() {
    if (!audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.04);

      gain.gain.setValueAtTime(0.25, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + 0.04);
    } catch (e) {}
  }

  // Celebratory Win Fanfare
  function playWinFanfare() {
    if (!audioContext) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.12);

        gain.gain.setValueAtTime(0, audioContext.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + index * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + index * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(audioContext.currentTime + index * 0.12);
        osc.stop(audioContext.currentTime + index * 0.12 + 0.65);
      });
    } catch (e) {}
  }

  // ===================================================================
  // 3. YOUTUBE PLAYER INTEGRATION (Nhạc Xổ Số: atq9S7pp1rQ)
  // ===================================================================

  // Load YouTube IFrame API script
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('yt-player', {
      height: '1',
      width: '1',
      videoId: 'atq9S7pp1rQ',
      playerVars: {
        autoplay: 0,
        controls: 0,
        loop: 1,
        playlist: 'atq9S7pp1rQ',
        playsinline: 1
      },
      events: {
        onReady: function () {
          // Ready for control
        },
        onStateChange: function (event) {
          if (event.data === YT.PlayerState.PLAYING) {
            setMusicPlayingState(true);
          } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            setMusicPlayingState(false);
          }
        }
      }
    });
  };

  function loadYouTubeScript() {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  function playLotteryMusic() {
    initAudioContext();
    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
      try {
        ytPlayer.playVideo();
        setMusicPlayingState(true);
      } catch (e) {}
    }
  }

  function pauseLotteryMusic() {
    if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      try {
        ytPlayer.pauseVideo();
        setMusicPlayingState(false);
      } catch (e) {}
    }
  }

  function setMusicPlayingState(isPlaying) {
    isMusicPlaying = isPlaying;
    if (isPlaying) {
      if (musicWave) musicWave.classList.add('playing');
      if (musicIcon) {
        musicIcon.className = 'fa-solid fa-pause';
      }
      if (musicStatusText) musicStatusText.textContent = 'Nhạc Xổ Số: Đang Phát 🎵';
    } else {
      if (musicWave) musicWave.classList.remove('playing');
      if (musicIcon) {
        musicIcon.className = 'fa-solid fa-play';
      }
      if (musicStatusText) musicStatusText.textContent = 'Nhạc Xổ Số: Tạm Dừng';
    }
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseLotteryMusic();
    } else {
      playLotteryMusic();
    }
  }

  // ===================================================================
  // 4. THE INTERACTIVE ENVELOPE (BỨC THƯ TO ĐÙNG)
  // ===================================================================

  function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    initAudioContext();
    playLotteryMusic();

    // Visual open effect
    if (envelopeWrapper) envelopeWrapper.classList.add('open');

    // Confetti pop
    if (window.confetti) {
      window.confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Smooth transition to full page
    setTimeout(() => {
      if (envelopeScreen) envelopeScreen.classList.add('opened');
      if (mainContent) mainContent.classList.add('visible');

      // Scroll smoothly to letter section
      const letterSec = document.getElementById('letterSection');
      if (letterSec) {
        letterSec.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1200);
  }

  // ===================================================================
  // 5. LUCKY WHEEL ENGINE (CANVAS & PHYSICS)
  // ===================================================================

  function drawWheel() {
    if (!wheelCanvas || !wheelCtx) return;

    const width = wheelCanvas.width;
    const height = wheelCanvas.height;
    const center = width / 2;
    const radius = center - 18;
    const numSlices = WHEEL_SECTORS.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    wheelCtx.clearRect(0, 0, width, height);

    // Draw Outer Rim with 3D ring
    wheelCtx.save();
    wheelCtx.translate(center, center);

    const outerGradient = wheelCtx.createRadialGradient(0, 0, radius + 2, 0, 0, radius + 16);
    outerGradient.addColorStop(0, '#be123c');
    outerGradient.addColorStop(0.5, '#f43f5e');
    outerGradient.addColorStop(1, '#9f1239');

    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, radius + 14, 0, 2 * Math.PI);
    wheelCtx.fillStyle = outerGradient;
    wheelCtx.fill();

    // Outer Rim Dots (Casino/Lottery Bulbs)
    const numBulbs = 24;
    for (let i = 0; i < numBulbs; i++) {
      const bulbAngle = (i * 2 * Math.PI) / numBulbs;
      const bx = (radius + 8) * Math.cos(bulbAngle);
      const by = (radius + 8) * Math.sin(bulbAngle);

      wheelCtx.beginPath();
      wheelCtx.arc(bx, by, 3.5, 0, 2 * Math.PI);
      wheelCtx.fillStyle = i % 2 === 0 ? '#fef08a' : '#ffffff';
      wheelCtx.shadowColor = '#fbbf24';
      wheelCtx.shadowBlur = 6;
      wheelCtx.fill();
      wheelCtx.shadowBlur = 0;
    }

    // Rotate canvas for wheel spin
    wheelCtx.rotate(currentWheelRotation);

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const sector = WHEEL_SECTORS[i];

      // Slice Path
      wheelCtx.beginPath();
      wheelCtx.moveTo(0, 0);
      wheelCtx.arc(0, 0, radius, startAngle, endAngle);
      wheelCtx.closePath();

      wheelCtx.fillStyle = sector.color;
      wheelCtx.fill();

      // Border between slices
      wheelCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      wheelCtx.lineWidth = 2;
      wheelCtx.stroke();

      // Text inside Slice
      wheelCtx.save();
      wheelCtx.rotate(startAngle + sliceAngle / 2);
      wheelCtx.textAlign = 'right';
      wheelCtx.fillStyle = sector.textColor;
      wheelCtx.font = 'bold 15px "Montserrat", sans-serif';
      wheelCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      wheelCtx.shadowBlur = 3;

      // Text and emoji
      wheelCtx.fillText(sector.shortName, radius - 24, 5);
      wheelCtx.restore();
    }

    wheelCtx.restore();
  }

  function spinWheel() {
    if (isSpinning) return;

    // Check if already played
    if (hasDevicePlayed()) {
      showAlreadyPlayedAlert();
      return;
    }

    // Validate Student Name
    const nameVal = studentNameInput ? studentNameInput.value.trim() : '';
    if (!nameVal) {
      alert('Vui lòng nhập Họ và Tên bạn nữ 10T1 trước khi quay để hệ thống ghi nhận quà nhé!');
      if (studentNameInput) studentNameInput.focus();
      return;
    }

    isSpinning = true;
    if (btnSpinWheel) btnSpinWheel.disabled = true;
    if (btnSpinAction) btnSpinAction.disabled = true;

    initAudioContext();
    playLotteryMusic();

    // Check available stock
    const stock = getStock();
    let eligibleIndices = [];

    WHEEL_SECTORS.forEach((sec, index) => {
      if (sec.type === 'lollipop') {
        if (stock.lollipops >= sec.amount) {
          eligibleIndices.push(index);
        }
      } else if (sec.type === 'candy') {
        if (stock.candies >= sec.amount) {
          eligibleIndices.push(index);
        }
      }
    });

    // Fallback if low stock
    if (eligibleIndices.length === 0) {
      eligibleIndices = [1, 4, 7]; // fallback candy slices
    }

    // Pick random target index
    const targetIndex = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
    const chosenSector = WHEEL_SECTORS[targetIndex];

    // Compute target rotation
    // Pointer is at the top (angle = -Math.PI / 2 or 3*PI/2)
    const numSlices = WHEEL_SECTORS.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    
    // In our coordinate system, pointer is at top (270 deg or 1.5 * PI)
    const targetSliceCenter = targetIndex * sliceAngle + sliceAngle / 2;
    const baseTargetAngle = (3 * Math.PI / 2) - targetSliceCenter;
    
    // Add multiple full spins (e.g. 6 to 9 full spins)
    const fullSpins = (6 + Math.floor(Math.random() * 3)) * (2 * Math.PI);
    const finalAngle = baseTargetAngle + fullSpins;

    const startTime = performance.now();
    const duration = 6500; // 6.5s of suspense!
    const startAngle = currentWheelRotation % (2 * Math.PI);
    const totalRotationToCover = finalAngle - startAngle;

    let lastTickSlice = -1;

    function animateSpin(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Deceleration curve (easeOutCubic or easeOutQuart)
      const ease = 1 - Math.pow(1 - progress, 3.8);

      currentWheelRotation = startAngle + totalRotationToCover * ease;
      drawWheel();

      // Tick sound check
      const currentSliceIndex = Math.floor(
        ((3 * Math.PI / 2 - (currentWheelRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / sliceAngle
      );
      if (currentSliceIndex !== lastTickSlice) {
        lastTickSlice = currentSliceIndex;
        playTickSound();
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Spin finished!
        isSpinning = false;
        handleSpinResult(nameVal, chosenSector);
      }
    }

    requestAnimationFrame(animateSpin);
  }

  function handleSpinResult(studentName, sector) {
    // 1. Deduct stock
    const stock = getStock();
    if (sector.type === 'lollipop') {
      stock.lollipops = Math.max(0, stock.lollipops - sector.amount);
    } else if (sector.type === 'candy') {
      stock.candies = Math.max(0, stock.candies - sector.amount);
    }
    saveStock(stock);
    updateStockDisplay();

    // 2. Generate unique verification code
    const deviceId = getOrCreateDeviceId();
    const prefix = sector.type === 'lollipop' ? '10T1-MUT' : '10T1-KEO';
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const verifyCode = `${prefix}-${sector.amount}-${randomHex}`;

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ngày ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    // 3. Create Ticket Object
    const ticket = {
      name: studentName,
      prizeName: sector.name,
      prizeDesc: sector.desc,
      prizeType: sector.type,
      prizeAmount: sector.amount,
      verifyCode: verifyCode,
      timeString: timeString,
      deviceId: deviceId,
      claimed: false
    };

    // 4. Save to Submissions list and LocalStorage
    const submissions = getSubmissions();
    submissions.unshift(ticket);
    saveSubmissions(submissions);

    // Save single-device lock
    localStorage.setItem(STORAGE_KEY_PLAYED, 'true');
    localStorage.setItem(STORAGE_KEY_TICKET, JSON.stringify(ticket));

    // 5. Celebration Effects
    playWinFanfare();

    if (window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 }
      });
      setTimeout(() => {
        window.confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        window.confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
    }

    // 6. Display Ticket
    setTimeout(() => {
      displayTicketView(ticket);
    }, 1000);
  }

  // ===================================================================
  // 6. SINGLE-DEVICE LOCK CHECK & TICKET RENDERING
  // ===================================================================

  function hasDevicePlayed() {
    return localStorage.getItem(STORAGE_KEY_PLAYED) === 'true';
  }

  function getSavedTicket() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TICKET);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function displayTicketView(ticket) {
    if (!ticket) return;

    if (gamePlayArea) gamePlayArea.style.display = 'none';
    if (ticketResultArea) ticketResultArea.style.display = 'block';

    if (ticketStudentName) ticketStudentName.textContent = ticket.name || 'Bạn nữ 10T1';
    if (ticketPrizeName) ticketPrizeName.textContent = ticket.prizeName;
    if (ticketPrizeDesc) ticketPrizeDesc.textContent = ticket.prizeDesc;
    if (ticketVerifyCode) ticketVerifyCode.textContent = ticket.verifyCode;
    if (ticketPlayTime) ticketPlayTime.textContent = ticket.timeString;
    if (ticketDeviceShortId) ticketDeviceShortId.textContent = `#${ticket.deviceId.split('-')[1] || 'DEV'}`;

    // Scroll to ticket
    if (ticketResultArea) {
      ticketResultArea.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function checkDeviceLockOnLoad() {
    if (hasDevicePlayed()) {
      const ticket = getSavedTicket();
      if (ticket) {
        displayTicketView(ticket);
      }
    }
  }

  function showAlreadyPlayedAlert() {
    alert('Bạn đã hoàn thành lượt quay trên thiết bị này rồi nhé! Hãy xem phiếu trúng thưởng bên dưới để nhận kẹo từ bạn Sơn.');
    if (ticketResultArea) {
      ticketResultArea.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ===================================================================
  // 7. ADMIN PORTAL (PASSWORD: Son2801@)
  // ===================================================================

  function openAdminModal() {
    if (adminModalBackdrop) {
      adminModalBackdrop.classList.add('active');
    }
    // Default view is login unless already logged in this session
    if (sessionStorage.getItem('10t1_admin_logged') === 'true') {
      showAdminDashboard();
    } else {
      showAdminLogin();
    }
  }

  function closeAdminModal() {
    if (adminModalBackdrop) {
      adminModalBackdrop.classList.remove('active');
    }
    if (loginErrorMsg) loginErrorMsg.style.display = 'none';
  }

  function showAdminLogin() {
    if (adminViewLogin) adminViewLogin.style.display = 'block';
    if (adminViewDashboard) adminViewDashboard.style.display = 'none';
    if (adminPassInput) {
      adminPassInput.value = '';
      adminPassInput.focus();
    }
  }

  function showAdminDashboard() {
    if (adminViewLogin) adminViewLogin.style.display = 'none';
    if (adminViewDashboard) adminViewDashboard.style.display = 'block';
    renderAdminStatsAndTable();
  }

  function handleAdminLogin() {
    const entered = adminPassInput ? adminPassInput.value : '';
    if (entered === ADMIN_PASSWORD) {
      if (loginErrorMsg) loginErrorMsg.style.display = 'none';
      sessionStorage.setItem('10t1_admin_logged', 'true');
      showAdminDashboard();
    } else {
      if (loginErrorMsg) loginErrorMsg.style.display = 'block';
      if (adminPassInput) {
        adminPassInput.value = '';
        adminPassInput.focus();
      }
    }
  }

  function handleAdminLogout() {
    sessionStorage.removeItem('10t1_admin_logged');
    showAdminLogin();
  }

  function renderAdminStatsAndTable() {
    const list = getSubmissions();
    const stock = getStock();

    // Stats
    const totalPlayers = list.length;
    let candyWon = 0;
    let lolliWon = 0;

    list.forEach(item => {
      if (item.prizeType === 'candy') candyWon += (item.prizeAmount || 1);
      if (item.prizeType === 'lollipop') lolliWon += (item.prizeAmount || 1);
    });

    if (dashTotalPlayers) dashTotalPlayers.textContent = totalPlayers;
    if (dashCandyWon) dashCandyWon.textContent = `${candyWon} / 5`;
    if (dashLollipopWon) dashLollipopWon.textContent = `${lolliWon} / 3`;

    // Claims Table
    if (!claimsTableBody) return;
    claimsTableBody.innerHTML = '';

    if (list.length === 0) {
      claimsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; padding: 20px;">Chưa có bạn nào quay thưởng. Dữ liệu sẽ xuất hiện khi có bạn nữ quay!</td></tr>`;
      return;
    }

    list.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${escapeHtml(item.prizeName)}</td>
        <td><code>${escapeHtml(item.verifyCode)}</code></td>
        <td style="font-size: 0.75rem;">${escapeHtml(item.timeString)}</td>
        <td>
          <button class="btn-toggle-claim ${item.claimed ? 'claimed' : 'pending'}" data-index="${index}">
            ${item.claimed ? '<i class="fa-solid fa-check"></i> Đã trao quà' : '<i class="fa-solid fa-clock"></i> Chưa nhận'}
          </button>
        </td>
        <td>
          <button class="btn-tool danger" style="padding: 2px 8px; font-size: 0.72rem;" data-del-index="${index}" title="Xoá mục này">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      claimsTableBody.appendChild(tr);
    });

    // Add listeners for claim toggle and delete
    claimsTableBody.querySelectorAll('.btn-toggle-claim').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-index'), 10);
        toggleClaimStatus(idx);
      });
    });

    claimsTableBody.querySelectorAll('[data-del-index]').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-del-index'), 10);
        deleteSubmission(idx);
      });
    });
  }

  function toggleClaimStatus(index) {
    const list = getSubmissions();
    if (list[index]) {
      list[index].claimed = !list[index].claimed;
      saveSubmissions(list);
      renderAdminStatsAndTable();
    }
  }

  function deleteSubmission(index) {
    if (confirm('Bạn có chắc muốn xoá thông tin quay này khỏi danh sách?')) {
      const list = getSubmissions();
      list.splice(index, 1);
      saveSubmissions(list);
      renderAdminStatsAndTable();
    }
  }

  function verifyCodeQuickly() {
    const code = verifyCodeInput ? verifyCodeInput.value.trim().toUpperCase() : '';
    if (!code) {
      showVerifyToast('Vui lòng nhập mã kiểm tra cần tra cứu!', 'fail');
      return;
    }

    const list = getSubmissions();
    const found = list.find(item => item.verifyCode.toUpperCase() === code);

    if (found) {
      showVerifyToast(
        `✅ MÃ HỢP LỆ: ${found.name} trúng ${found.prizeName} (${found.claimed ? 'ĐÃ NHẬN' : 'CHƯA NHẬN'}) lúc ${found.timeString}`,
        'success'
      );
    } else {
      showVerifyToast(`❌ KHÔNG TÌM THẤY mã "${code}". Vui lòng kiểm tra lại thiết bị của bạn nữ!`, 'fail');
    }
  }

  function showVerifyToast(msg, type) {
    if (!verifyResultToast) return;
    verifyResultToast.textContent = msg;
    verifyResultToast.className = `verify-result-toast ${type}`;
    verifyResultToast.style.display = 'block';
  }

  function resetCurrentDevice() {
    if (confirm('Xoá trạng thái quay của máy này? Sau khi xoá, thiết bị này có thể nhập tên và quay lại.')) {
      localStorage.removeItem(STORAGE_KEY_PLAYED);
      localStorage.removeItem(STORAGE_KEY_TICKET);

      if (gamePlayArea) gamePlayArea.style.display = 'flex';
      if (ticketResultArea) ticketResultArea.style.display = 'none';
      if (btnSpinWheel) btnSpinWheel.disabled = false;
      if (btnSpinAction) btnSpinAction.disabled = false;

      closeAdminModal();
      alert('Đã xoá lượt quay thành công! Bạn có thể thử nghiệm quay lại.');
    }
  }

  function resetAllData() {
    if (confirm('CẢNH BÁO: Thao tác này sẽ xoá toàn bộ danh sách trúng thưởng và khôi phục số lượng kẹo ban đầu. Bạn có chắc chắn không?')) {
      localStorage.removeItem(STORAGE_KEY_SUBMISSIONS);
      localStorage.removeItem(STORAGE_KEY_PLAYED);
      localStorage.removeItem(STORAGE_KEY_TICKET);
      saveStock({ ...DEFAULT_STOCK });
      updateStockDisplay();
      renderAdminStatsAndTable();

      if (gamePlayArea) gamePlayArea.style.display = 'flex';
      if (ticketResultArea) ticketResultArea.style.display = 'none';

      alert('Đã reset toàn bộ hệ thống!');
    }
  }

  function exportJSONData() {
    const list = getSubmissions();
    const jsonStr = JSON.stringify(list, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DanhSachTrungThuong_10T1_20-10_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // ===================================================================
  // 8. FALLING PETALS CANVAS (CANVAS SAKURA / ROSE PETALS)
  // ===================================================================

  function initPetals() {
    const canvas = document.getElementById('petals-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const petalCount = 28;
    const petals = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        r: Math.random() * 6 + 4,
        d: Math.random() * petalCount,
        color: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6'][Math.floor(Math.random() * 5)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleInc: Math.random() * 0.07 + 0.03,
        tiltAngle: 0
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < petalCount; i++) {
        const p = petals[i];
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();
      }
      update();
      requestAnimationFrame(draw);
    }

    function update() {
      for (let i = 0; i < petalCount; i++) {
        const p = petals[i];
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.d) + 2 + p.r / 3) * 0.6;
        p.x += Math.sin(p.d) * 1.2;
        p.tilt = Math.sin(p.tiltAngle - i / 3) * 12;

        if (p.x > width + 15 || p.x < -15 || p.y > height) {
          p.x = Math.random() * width;
          p.y = -20;
          p.tilt = Math.floor(Math.random() * 10) - 10;
        }
      }
    }

    draw();
  }

  // ===================================================================
  // 9. EVENT LISTENERS SETUP
  // ===================================================================

  function setupEvents() {
    // Open Envelope triggers
    if (waxSeal) waxSeal.addEventListener('click', openEnvelope);
    if (btnOpenEnvelopeAction) btnOpenEnvelopeAction.addEventListener('click', openEnvelope);
    if (envelopeWrapper) {
      envelopeWrapper.addEventListener('click', function (e) {
        if (!isEnvelopeOpened) openEnvelope();
      });
    }

    // Music controls
    if (musicPill) musicPill.addEventListener('click', toggleMusic);
    if (toggleMusicBtn) {
      toggleMusicBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMusic();
      });
    }

    // Spin Wheel triggers
    if (btnSpinWheel) btnSpinWheel.addEventListener('click', spinWheel);
    if (btnSpinAction) btnSpinAction.addEventListener('click', spinWheel);

    // Clear input button
    if (btnClearName && studentNameInput) {
      btnClearName.addEventListener('click', () => {
        studentNameInput.value = '';
        studentNameInput.focus();
      });
    }

    // Admin portal triggers
    if (openAdminModalBtn) openAdminModalBtn.addEventListener('click', openAdminModal);
    if (footerAdminBtn) footerAdminBtn.addEventListener('click', openAdminModal);
    if (closeAdminModalBtn) closeAdminModalBtn.addEventListener('click', closeAdminModal);
    if (adminModalBackdrop) {
      adminModalBackdrop.addEventListener('click', function (e) {
        if (e.target === adminModalBackdrop) closeAdminModal();
      });
    }

    // Admin login form
    if (btnAdminLogin) btnAdminLogin.addEventListener('click', handleAdminLogin);
    if (adminPassInput) {
      adminPassInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleAdminLogin();
      });
    }

    // Password Eye toggle
    if (btnToggleEye && adminPassInput && eyeIcon) {
      btnToggleEye.addEventListener('click', function () {
        if (adminPassInput.type === 'password') {
          adminPassInput.type = 'text';
          eyeIcon.className = 'fa-solid fa-eye-slash';
        } else {
          adminPassInput.type = 'password';
          eyeIcon.className = 'fa-solid fa-eye';
        }
      });
    }

    // Admin dashboard actions
    if (btnAdminLogout) btnAdminLogout.addEventListener('click', handleAdminLogout);
    if (btnVerifyCode) btnVerifyCode.addEventListener('click', verifyCodeQuickly);
    if (verifyCodeInput) {
      verifyCodeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') verifyCodeQuickly();
      });
    }
    if (btnResetCurrentDevice) btnResetCurrentDevice.addEventListener('click', resetCurrentDevice);
    if (btnResetAllData) btnResetAllData.addEventListener('click', resetAllData);
    if (btnExportJSON) btnExportJSON.addEventListener('click', exportJSONData);
  }

  // ===================================================================
  // 10. DOM READY
  // ===================================================================

  document.addEventListener('DOMContentLoaded', () => {
    getOrCreateDeviceId();
    loadYouTubeScript();
    initPetals();
    drawWheel();
    updateStockDisplay();
    checkDeviceLockOnLoad();
    setupEvents();
  });

})();
