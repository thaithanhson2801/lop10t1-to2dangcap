/**
 * ===================================================================
 * 20/10 YÊU THƯƠNG - GỬI PHÁI ĐẸP LỚP 10T1 | TỔ 2 ĐẲNG CẤP
 * Core Interactivity, Lucky Wheel, Audio, Security & Admin Engine
 * Admin Password: Son2801@
 * Cross-Device Cryptographic Verification Engine
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
  const STORAGE_KEY_ADMIN_CLAIMS = '10t1_2010_admin_claims_v2';

  // 8 pure candy & lollipop sectors (Phần thưởng không giới hạn - Sơn bao tất cả!)
  const WHEEL_SECTORS = [
    {
      id: 'lolli_2_a',
      prizeKey: 'MUT2',
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
      prizeKey: 'KEO1',
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
      prizeKey: 'MUT1',
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
      prizeKey: 'KEO2',
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
      prizeKey: 'KEO1',
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
      prizeKey: 'MUT1',
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
      prizeKey: 'KEO2',
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
      prizeKey: 'KEO1',
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
  let pendingPlayMusic = false;
  let currentPendingVerification = null;

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
  const verifyActionBox = document.getElementById('verifyActionBox');
  const verifyStudentNameInput = document.getElementById('verifyStudentNameInput');
  const btnConfirmHandout = document.getElementById('btnConfirmHandout');

  const dashTotalPlayers = document.getElementById('dashTotalPlayers');
  const dashCandyWon = document.getElementById('dashCandyWon');
  const dashLollipopWon = document.getElementById('dashLollipopWon');
  const claimsTableBody = document.getElementById('claimsTableBody');
  const btnResetCurrentDevice = document.getElementById('btnResetCurrentDevice');
  const btnResetAllData = document.getElementById('btnResetAllData');
  const btnExportJSON = document.getElementById('btnExportJSON');

  // ===================================================================
  // 1. CRYPTOGRAPHIC SIGNATURE & VERIFICATION ENGINE (CROSS-DEVICE)
  // ===================================================================

  // Computes a deterministic 4-character hex signature using ADMIN_PASSWORD as secret salt
  function computeChecksum(prizeKey, seed) {
    const str = ADMIN_PASSWORD + '_' + prizeKey + '_' + seed;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).substring(0, 4).toUpperCase().padStart(4, '0');
  }

  // Generates a verifiable code: 10T1-[PRIZE]-[SEED2][SIG4]
  // Example: 10T1-MUT2-8433CD
  function generateSecureVoucher(prizeKey) {
    const seed = Math.floor(10 + Math.random() * 89).toString(); // 2 digits
    const sig = computeChecksum(prizeKey, seed); // 4 chars
    return `10T1-${prizeKey}-${seed}${sig}`;
  }

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

  function getAdminClaims() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ADMIN_CLAIMS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAdminClaims(list) {
    localStorage.setItem(STORAGE_KEY_ADMIN_CLAIMS, JSON.stringify(list));
  }

  // ===================================================================
  // 2. WEB AUDIO API SYNTHESIZER
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

  function playTickSound() {
    if (!audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, audioContext.currentTime + 0.04);

      gain.gain.setValueAtTime(0.25, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + 0.04);
    } catch (e) {}
  }

  function playWinFanfare() {
    if (!audioContext) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
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
  // 3. YOUTUBE PLAYER INTEGRATION (Nhạc Xổ Số Bất Ngờ: atq9S7pp1rQ)
  // ===================================================================

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
          if (pendingPlayMusic) {
            try {
              ytPlayer.playVideo();
              setMusicPlayingState(true);
            } catch (e) {}
          }
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
    pendingPlayMusic = true;
    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
      try {
        ytPlayer.playVideo();
        setMusicPlayingState(true);
      } catch (e) {}
    }
  }

  function pauseLotteryMusic() {
    pendingPlayMusic = false;
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
      if (musicStatusText) musicStatusText.textContent = 'Giai Điệu Bí Mật: Đang Phát 🎵';
    } else {
      if (musicWave) musicWave.classList.remove('playing');
      if (musicIcon) {
        musicIcon.className = 'fa-solid fa-play';
      }
      if (musicStatusText) musicStatusText.textContent = 'Giai Điệu: Tạm Dừng';
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

    if (envelopeWrapper) envelopeWrapper.classList.add('open');

    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 85,
        origin: { y: 0.6 }
      });
    }

    setTimeout(() => {
      if (envelopeScreen) envelopeScreen.classList.add('opened');
      if (mainContent) mainContent.classList.add('visible');

      const letterSec = document.getElementById('letterSection');
      if (letterSec) {
        letterSec.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1100);
  }

  // ===================================================================
  // 5. LUCKY WHEEL ENGINE (8 CẢNH KẸO - KHÔNG GIỚI HẠN)
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

    // Outer Rim with 3D ring
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

    // Outer Rim Bulbs
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

    wheelCtx.rotate(currentWheelRotation);

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const sector = WHEEL_SECTORS[i];

      wheelCtx.beginPath();
      wheelCtx.moveTo(0, 0);
      wheelCtx.arc(0, 0, radius, startAngle, endAngle);
      wheelCtx.closePath();

      wheelCtx.fillStyle = sector.color;
      wheelCtx.fill();

      wheelCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      wheelCtx.lineWidth = 2;
      wheelCtx.stroke();

      wheelCtx.save();
      wheelCtx.rotate(startAngle + sliceAngle / 2);
      wheelCtx.textAlign = 'right';
      wheelCtx.fillStyle = sector.textColor;
      wheelCtx.font = 'bold 15px "Montserrat", sans-serif';
      wheelCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      wheelCtx.shadowBlur = 3;

      wheelCtx.fillText(sector.shortName, radius - 22, 5);
      wheelCtx.restore();
    }

    wheelCtx.restore();
  }

  function spinWheel() {
    if (isSpinning) return;

    if (hasDevicePlayed()) {
      showAlreadyPlayedAlert();
      return;
    }

    const nameVal = studentNameInput ? studentNameInput.value.trim() : '';
    if (!nameVal) {
      alert('Vui lòng nhập Họ và Tên bạn nữ 10T1 trước khi quay nhé!');
      if (studentNameInput) studentNameInput.focus();
      return;
    }

    isSpinning = true;
    if (btnSpinWheel) btnSpinWheel.disabled = true;
    if (btnSpinAction) btnSpinAction.disabled = true;

    initAudioContext();
    playLotteryMusic();

    // Equal fair chance among all 8 candy slices (Không giới hạn quà!)
    const targetIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const chosenSector = WHEEL_SECTORS[targetIndex];

    const numSlices = WHEEL_SECTORS.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const targetSliceCenter = targetIndex * sliceAngle + sliceAngle / 2;
    const baseTargetAngle = (3 * Math.PI / 2) - targetSliceCenter;

    const fullSpins = (6 + Math.floor(Math.random() * 3)) * (2 * Math.PI);
    const finalAngle = baseTargetAngle + fullSpins;

    const startTime = performance.now();
    const duration = 6500;
    const startAngle = currentWheelRotation % (2 * Math.PI);
    const totalRotationToCover = finalAngle - startAngle;

    let lastTickSlice = -1;

    function animateSpin(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3.8);

      currentWheelRotation = startAngle + totalRotationToCover * ease;
      drawWheel();

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
        isSpinning = false;
        handleSpinResult(nameVal, chosenSector);
      }
    }

    requestAnimationFrame(animateSpin);
  }

  function handleSpinResult(studentName, sector) {
    // Generate mathematically verifiable voucher code
    const deviceId = getOrCreateDeviceId();
    const verifyCode = generateSecureVoucher(sector.prizeKey);

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ngày ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    const ticket = {
      name: studentName,
      prizeKey: sector.prizeKey,
      prizeName: sector.name,
      prizeDesc: sector.desc,
      prizeType: sector.type,
      prizeAmount: sector.amount,
      verifyCode: verifyCode,
      timeString: timeString,
      deviceId: deviceId,
      claimed: false
    };

    // Save locally to lock this device
    const submissions = getSubmissions();
    submissions.unshift(ticket);
    saveSubmissions(submissions);

    localStorage.setItem(STORAGE_KEY_PLAYED, 'true');
    localStorage.setItem(STORAGE_KEY_TICKET, JSON.stringify(ticket));

    playWinFanfare();

    if (window.confetti) {
      window.confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      setTimeout(() => {
        window.confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
        window.confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
      }, 400);
    }

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
    alert('Bạn đã hoàn thành lượt quay trên thiết bị này rồi nhé! Hãy đưa mã trúng thưởng bên dưới cho bạn Sơn để nhận kẹo.');
    if (ticketResultArea) {
      ticketResultArea.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ===================================================================
  // 7. ADMIN PORTAL (CROSS-DEVICE VERIFICATION: Son2801@)
  // ===================================================================

  function openAdminModal() {
    if (adminModalBackdrop) {
      adminModalBackdrop.classList.add('active');
    }
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
    renderAdminDashboard();
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

  // CORE FIX: Cross-Device Mathematical Code Verifier
  function verifyCodeQuickly() {
    const input = verifyCodeInput ? verifyCodeInput.value.trim().toUpperCase() : '';
    if (!input) {
      showVerifyToast('Vui lòng nhập mã kiểm tra trên điện thoại của bạn nữ!', 'fail');
      if (verifyActionBox) verifyActionBox.style.display = 'none';
      return;
    }

    // Match code format: 10T1-(MUT2|MUT1|KEO2|KEO1)-[SEED2][SIG4] or without 10T1-
    const match = input.match(/(?:10T1-)?(MUT2|MUT1|KEO2|KEO1)-?([0-9A-Z]{6})/);

    // Also check local submissions for backwards compatibility
    const localList = getSubmissions();
    const localFound = localList.find(item => item.verifyCode.toUpperCase() === input);

    let prizeKey = '';
    let token = '';
    let prizeName = '';
    let prizeType = '';
    let prizeAmount = 1;

    if (match) {
      prizeKey = match[1];
      token = match[2];
      const seed = token.substring(0, 2);
      const receivedSig = token.substring(2);
      const expectedSig = computeChecksum(prizeKey, seed);

      if (receivedSig !== expectedSig) {
        showVerifyToast(`❌ MÃ KHÔNG HỢP LỆ! Mã "${input}" không đúng thuật toán bảo mật của 10T1 hoặc đã bị chỉnh sửa!`, 'fail');
        if (verifyActionBox) verifyActionBox.style.display = 'none';
        return;
      }

      const PRIZE_DETAILS = {
        'MUT2': { name: '2 Cây Kẹo Mút 🍭🍭', amount: 2, type: 'lollipop' },
        'MUT1': { name: '1 Cây Kẹo Mút 🍭', amount: 1, type: 'lollipop' },
        'KEO2': { name: '2 Cục Kẹo Ngọt 🍬🍬', amount: 2, type: 'candy' },
        'KEO1': { name: '1 Cục Kẹo Ngọt 🍬', amount: 1, type: 'candy' }
      };

      const p = PRIZE_DETAILS[prizeKey];
      prizeName = p.name;
      prizeType = p.type;
      prizeAmount = p.amount;
    } else if (localFound) {
      prizeKey = localFound.prizeKey || 'KEO1';
      token = localFound.verifyCode.split('-').pop();
      prizeName = localFound.prizeName;
      prizeType = localFound.prizeType;
      prizeAmount = localFound.prizeAmount;
    } else {
      showVerifyToast(`❌ MÃ KHÔNG ĐÚNG ĐỊNH DẠNG! Mã chuẩn có dạng: 10T1-MUT2-XXXXXX hoặc 10T1-KEO2-XXXXXX`, 'fail');
      if (verifyActionBox) verifyActionBox.style.display = 'none';
      return;
    }

    const normalizedCode = `10T1-${prizeKey}-${token}`;

    // Check if this code was already handed out on this admin device
    const adminClaims = getAdminClaims();
    const alreadyClaimed = adminClaims.find(item => item.code === normalizedCode);

    if (alreadyClaimed) {
      showVerifyToast(
        `⚠️ CẢNH BÁO: Mã "${normalizedCode}" ĐÃ ĐƯỢC TRAO QUÀ trước đó cho bạn "${alreadyClaimed.name}" lúc ${alreadyClaimed.time}!\n(Hãy nhắc bạn nữ không nhận kẹo lần 2 nhé)`,
        'warning'
      );
      if (verifyActionBox) verifyActionBox.style.display = 'none';
      return;
    }

    // Set pending verification object
    currentPendingVerification = {
      code: normalizedCode,
      prizeName: prizeName,
      prizeType: prizeType,
      prizeAmount: prizeAmount
    };

    showVerifyToast(
      `✅ XÁC THỰC THÀNH CÔNG! Mã chính xác từ hệ thống 10T1.\n🎁 PHẦN THƯỞNG: ${prizeName}\n👉 Sơn hãy trao quà cho bạn nữ và bấm xác nhận bên dưới:`,
      'success'
    );

    if (verifyActionBox) verifyActionBox.style.display = 'block';
    if (verifyStudentNameInput) {
      verifyStudentNameInput.value = localFound ? localFound.name : '';
      verifyStudentNameInput.focus();
    }
  }

  // Action: Sơn confirms handout
  function confirmHandout() {
    if (!currentPendingVerification) return;

    const nameVal = verifyStudentNameInput ? verifyStudentNameInput.value.trim() : '';
    const finalName = nameVal || 'Bạn Nữ 10T1';

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ngày ${now.getDate()}/${now.getMonth() + 1}`;

    const newClaim = {
      code: currentPendingVerification.code,
      name: finalName,
      prizeName: currentPendingVerification.prizeName,
      prizeType: currentPendingVerification.prizeType,
      prizeAmount: currentPendingVerification.prizeAmount,
      time: timeStr
    };

    const adminClaims = getAdminClaims();
    adminClaims.unshift(newClaim);
    saveAdminClaims(adminClaims);

    currentPendingVerification = null;
    if (verifyActionBox) verifyActionBox.style.display = 'none';
    if (verifyCodeInput) verifyCodeInput.value = '';

    showVerifyToast(`🎉 ĐÃ XÁC NHẬN TRAO ${newClaim.prizeName} CHO BẠN: "${finalName}"!`, 'success');
    renderAdminDashboard();
  }

  function renderAdminDashboard() {
    const adminClaims = getAdminClaims();

    let totalCandy = 0;
    let totalLollipop = 0;

    adminClaims.forEach(item => {
      if (item.prizeType === 'candy') totalCandy += (item.prizeAmount || 1);
      if (item.prizeType === 'lollipop') totalLollipop += (item.prizeAmount || 1);
    });

    if (dashTotalPlayers) dashTotalPlayers.textContent = adminClaims.length;
    if (dashCandyWon) dashCandyWon.textContent = `${totalCandy} 🍬`;
    if (dashLollipopWon) dashLollipopWon.textContent = `${totalLollipop} 🍭`;

    if (!claimsTableBody) return;
    claimsTableBody.innerHTML = '';

    if (adminClaims.length === 0) {
      claimsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; padding: 20px;">Chưa có bạn nào được xác nhận trao quà. Hãy gõ mã từ điện thoại của bạn nữ vào ô trên để kiểm tra và trao quà!</td></tr>`;
      return;
    }

    adminClaims.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${escapeHtml(item.prizeName)}</td>
        <td><code>${escapeHtml(item.code)}</code></td>
        <td style="font-size: 0.75rem;">${escapeHtml(item.time)}</td>
        <td>
          <span class="btn-toggle-claim claimed"><i class="fa-solid fa-circle-check"></i> Đã trao quà</span>
        </td>
        <td>
          <button class="btn-tool danger" style="padding: 2px 8px; font-size: 0.72rem;" data-del-claim="${index}" title="Xoá mục này">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      claimsTableBody.appendChild(tr);
    });

    claimsTableBody.querySelectorAll('[data-del-claim]').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-del-claim'), 10);
        deleteAdminClaim(idx);
      });
    });
  }

  function deleteAdminClaim(index) {
    if (confirm('Bạn có chắc muốn xoá mục này khỏi danh sách đã trao quà?')) {
      const adminClaims = getAdminClaims();
      adminClaims.splice(index, 1);
      saveAdminClaims(adminClaims);
      renderAdminDashboard();
    }
  }

  function showVerifyToast(msg, type) {
    if (!verifyResultToast) return;
    verifyResultToast.innerHTML = msg.replace(/\n/g, '<br>');
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
      alert('Đã xoá lượt quay của máy này! Bạn có thể thử nghiệm quay lại.');
    }
  }

  function resetAllData() {
    if (confirm('CẢNH BÁO: Thao tác này sẽ xoá toàn bộ danh sách đã trao quà và lượt quay. Bạn có chắc chắn không?')) {
      localStorage.removeItem(STORAGE_KEY_SUBMISSIONS);
      localStorage.removeItem(STORAGE_KEY_PLAYED);
      localStorage.removeItem(STORAGE_KEY_TICKET);
      localStorage.removeItem(STORAGE_KEY_ADMIN_CLAIMS);

      renderAdminDashboard();

      if (gamePlayArea) gamePlayArea.style.display = 'flex';
      if (ticketResultArea) ticketResultArea.style.display = 'none';

      alert('Đã reset toàn bộ hệ thống!');
    }
  }

  function exportJSONData() {
    const list = getAdminClaims();
    const jsonStr = JSON.stringify(list, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DanhSachDaTraoQua_10T1_20-10_${Date.now()}.json`;
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
  // 8. FALLING PETALS CANVAS
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
    if (waxSeal) waxSeal.addEventListener('click', openEnvelope);
    if (btnOpenEnvelopeAction) btnOpenEnvelopeAction.addEventListener('click', openEnvelope);
    if (envelopeWrapper) {
      envelopeWrapper.addEventListener('click', function (e) {
        if (!isEnvelopeOpened) openEnvelope();
      });
    }

    if (musicPill) musicPill.addEventListener('click', toggleMusic);
    if (toggleMusicBtn) {
      toggleMusicBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMusic();
      });
    }

    if (btnSpinWheel) btnSpinWheel.addEventListener('click', spinWheel);
    if (btnSpinAction) btnSpinAction.addEventListener('click', spinWheel);

    if (btnClearName && studentNameInput) {
      btnClearName.addEventListener('click', () => {
        studentNameInput.value = '';
        studentNameInput.focus();
      });
    }

    if (openAdminModalBtn) openAdminModalBtn.addEventListener('click', openAdminModal);
    if (footerAdminBtn) footerAdminBtn.addEventListener('click', openAdminModal);
    if (closeAdminModalBtn) closeAdminModalBtn.addEventListener('click', closeAdminModal);
    if (adminModalBackdrop) {
      adminModalBackdrop.addEventListener('click', function (e) {
        if (e.target === adminModalBackdrop) closeAdminModal();
      });
    }

    if (btnAdminLogin) btnAdminLogin.addEventListener('click', handleAdminLogin);
    if (adminPassInput) {
      adminPassInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleAdminLogin();
      });
    }

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

    if (btnAdminLogout) btnAdminLogout.addEventListener('click', handleAdminLogout);

    // Cross-Device Verification Actions
    if (btnVerifyCode) btnVerifyCode.addEventListener('click', verifyCodeQuickly);
    if (verifyCodeInput) {
      verifyCodeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') verifyCodeQuickly();
      });
    }
    if (btnConfirmHandout) btnConfirmHandout.addEventListener('click', confirmHandout);
    if (verifyStudentNameInput) {
      verifyStudentNameInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') confirmHandout();
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
    checkDeviceLockOnLoad();
    setupEvents();
  });

})();
