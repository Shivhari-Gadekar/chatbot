// ============================
// Ramdwara Chat - Main Script
// ============================

// --- Dynamically load CSS ---
function loadCSS(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

// --- Dynamically load JS ---
function loadJS(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// --- Inject Chat UI into the page ---
function injectChatHTML() {
  const html = `
    <div class="rd-launcher">
      <button id="rdOpenChat" title="Chat with Ramdwara">
        <i class="bi bi-chat-dots-fill" style="font-size:30px"></i>
        <span class="rd-unread" id="rdUnread">0</span>
      </button>
    </div>

    <div class="rd-window minimized" id="rdWindow">
      <div class="rd-header">
        <div class="d-flex align-items-center">
          <img src="https://ramdwara.com/public/images/ramlogo.png" width="36" alt="Ramdwara">
          <div class="ms-2">
            <h6 class="mb-0 fw-bold">Ramdwara Chat</h6>
            <small>Ask about Baniji, Granth or Satsang</small>
          </div>
        </div>
        <div class="rd-actions">
          <button id="rdThemeToggle"><i id="rdThemeIcon" class="bi bi-moon-stars-fill"></i></button>
          <button id="rdClose"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>

      <div class="rd-messages" id="rdMessages"></div>
      <div class="p-2" id="chatSuggestions"></div>

      <div class="rd-footer">
        <input id="rdInput" type="text" placeholder="Type your question..." />
        <button id="rdSend"><i class="bi bi-send-fill"></i></button>
      </div>
    </div>
  `;
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

// --- Initialize Chat ---
(async function initRamdwaraChat() {
  loadCSS('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
  loadCSS('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css');
  loadCSS('style.css');

  await loadJS('faq-data.js'); // loads qnaList[]

  injectChatHTML();

  // DOM references
  const rdWindow = document.getElementById('rdWindow');
  const rdOpenChat = document.getElementById('rdOpenChat');
  const rdClose = document.getElementById('rdClose');
  const rdThemeToggle = document.getElementById('rdThemeToggle');
  const rdThemeIcon = document.getElementById('rdThemeIcon');
  const rdMessages = document.getElementById('rdMessages');
  const rdSend = document.getElementById('rdSend');
  const rdInput = document.getElementById('rdInput');
  const chatSuggestions = document.getElementById('chatSuggestions');

  // --- Open / Close ---
  rdOpenChat.addEventListener('click', () => {
    rdWindow.classList.toggle('minimized');
    if (!rdMessages.querySelector('.rd-welcome')) {
      const msg = document.createElement('div');
      msg.classList.add('rd-bubble', 'bot', 'rd-welcome');
      msg.textContent = '🙏 राम राम — मैं रामद्वारा सहायक हूँ। मैं आपकी किस प्रकार सहायता कर सकता हूँ?';
      rdMessages.appendChild(msg);
    }
  });
  rdClose.addEventListener('click', () => rdWindow.classList.add('minimized'));

  // --- Theme Toggle ---
  rdThemeToggle.addEventListener('click', () => {
    rdWindow.classList.toggle('dark');
    rdThemeIcon.className = rdWindow.classList.contains('dark')
      ? 'bi bi-sun-fill'
      : 'bi bi-moon-stars-fill';
  });

  // --- Helpers ---
  function appendMessage(content, sender) {
    const msg = document.createElement('div');
    msg.className = `rd-bubble ${sender}`;
    msg.innerText = content;
    rdMessages.appendChild(msg);
    rdMessages.scrollTo({ top: rdMessages.scrollHeight, behavior: 'smooth' });
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'rd-bubble bot typing-bubble';
    typing.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
    rdMessages.appendChild(typing);
    rdMessages.scrollTo({ top: rdMessages.scrollHeight, behavior: 'smooth' });
    return typing;
  }

  // --- Send Message ---
  function sendMessage() {
    const text = rdInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    rdInput.value = '';

    const match = qnaList.find(q => text.toLowerCase().includes(q.question.toLowerCase()));
    const reply = match ? match.answer : '🙏 मैं अभी सीख रहा हूँ — कृपया दूसरा प्रश्न आज़माएँ।';

    const typing = showTyping();
    setTimeout(() => {
      typing.remove();
      appendMessage(reply, 'bot');
    }, 1200);
  }

  rdSend.addEventListener('click', sendMessage);
  rdInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });

  // --- Render Suggestions ---
  function renderSuggestions() {
    chatSuggestions.innerHTML = '';
    qnaList.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'suggest-btn';
      btn.innerText = q.question;
      btn.addEventListener('click', () => {
        appendMessage(q.question, 'user');
        const typing = showTyping();
        setTimeout(() => {
          typing.remove();
          appendMessage(q.answer, 'bot');
        }, 1000);
      });
      chatSuggestions.appendChild(btn);
    });
  }

  renderSuggestions();
})();
