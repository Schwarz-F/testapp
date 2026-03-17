export function initMailchat(documentRef) {
  const state = {
    accounts: [],
    accountId: null,
    chats: new Map(),
    activeEmail: null,
  };

  const el = {
    accountSelect: documentRef.getElementById('accountSelect'),
    syncBtn: documentRef.getElementById('syncBtn'),
    openTabBtn: documentRef.getElementById('openTabBtn'),
    chatList: documentRef.getElementById('chatList'),
    chatHeader: documentRef.getElementById('chatHeader'),
    messages: documentRef.getElementById('messages'),
    sendForm: documentRef.getElementById('sendForm'),
    toInput: documentRef.getElementById('toInput'),
    bodyInput: documentRef.getElementById('bodyInput'),
    sendBtn: documentRef.getElementById('sendBtn'),
    chatItemTpl: documentRef.getElementById('chatItemTpl'),
  };

  const EMAIL_RE = /<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)>?/;

  function extractEmail(value = '') {
    const m = String(value).match(EMAIL_RE);
    return (m?.[1] || value || '').trim().toLowerCase();
  }

  function stripQuoted(text = '') {
    return String(text)
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter((line) => !line.startsWith('>') && !/^On .*wrote:$/i.test(line) && !/^Am .*schrieb.*:$/i.test(line))
      .join('\n')
      .trim();
  }

  function fmtDate(ts) {
    try { return new Date(ts).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }); }
    catch { return ts || ''; }
  }

  function autoGrow() {
    el.bodyInput.style.height = 'auto';
    el.bodyInput.style.height = `${Math.min(160, Math.max(34, el.bodyInput.scrollHeight))}px`;
  }

  async function listAccountFolders(accountId) {
    const account = state.accounts.find((a) => Number(a.id) === Number(accountId));
    return account?.folders || [];
  }

  function flattenFolders(folders, out = []) {
    for (const f of folders || []) {
      out.push(f);
      if (f.subFolders?.length) flattenFolders(f.subFolders, out);
    }
    return out;
  }

  function pickFolderByType(folders, typeWanted) {
    return folders.find((f) => String(f.type || '').toLowerCase() === typeWanted) || null;
  }

  async function fetchFolderMessages(folder, limit = 200) {
    if (!folder) return [];
    const all = [];
    let page = await browser.messages.list(folder);
    while (page?.messages?.length) {
      all.push(...page.messages);
      if (all.length >= limit || !page.id) break;
      page = await browser.messages.continueList(page.id);
    }
    return all.slice(0, limit);
  }

  function upsertChatMessage(map, email, msg) {
    if (!email) return;
    const key = email.toLowerCase();
    if (!map.has(key)) map.set(key, { email: key, messages: [], unread: 0, lastDate: '' });
    const chat = map.get(key);
    chat.messages.push(msg);
    if (msg.direction === 'inbound' && !msg.read) chat.unread += 1;
    if (!chat.lastDate || String(msg.date || '') > String(chat.lastDate)) chat.lastDate = msg.date;
  }

  async function rebuildChats() {
    if (!state.accountId) return;
    const folders = flattenFolders(await listAccountFolders(state.accountId));
    const inbox = pickFolderByType(folders, 'inbox');
    const sent = pickFolderByType(folders, 'sent');
    const [inboxMsgs, sentMsgs] = await Promise.all([fetchFolderMessages(inbox, 250), fetchFolderMessages(sent, 250)]);
    const chatMap = new Map();

    for (const m of inboxMsgs) {
      const full = await browser.messages.getFull(m.id);
      const text = stripQuoted(m.subject ? `${m.subject}\n${m.snippet || ''}` : (m.snippet || ''));
      const from = extractEmail(m.author || full?.headers?.from?.[0] || '');
      upsertChatMessage(chatMap, from, {
        id: m.id,
        direction: 'inbound',
        body: text || '(leer)',
        date: m.date,
        read: m.read,
        externalMessageId: full?.headers?.['message-id']?.[0] || '',
      });
    }

    for (const m of sentMsgs) {
      const full = await browser.messages.getFull(m.id);
      const toHeader = full?.headers?.to?.[0] || m.recipients?.[0] || '';
      const to = extractEmail(toHeader);
      const text = stripQuoted(m.subject ? `${m.subject}\n${m.snippet || ''}` : (m.snippet || ''));
      upsertChatMessage(chatMap, to, {
        id: m.id,
        direction: 'outbound',
        body: text || '(leer)',
        date: m.date,
        read: true,
        externalMessageId: full?.headers?.['message-id']?.[0] || '',
      });
    }

    for (const chat of chatMap.values()) {
      chat.messages.sort((a, b) => new Date(a.date) - new Date(b.date));
      chat.lastBody = chat.messages.at(-1)?.body || '';
    }

    state.chats = new Map([...chatMap.entries()].sort((a, b) => (a[1].lastDate < b[1].lastDate ? 1 : -1)));
    renderChatList();
    if (state.activeEmail && state.chats.has(state.activeEmail)) renderActiveChat();
  }

  function renderChatList() {
    el.chatList.innerHTML = '';
    for (const [email, chat] of state.chats.entries()) {
      const node = el.chatItemTpl.content.firstElementChild.cloneNode(true);
      node.querySelector('.name').textContent = email;
      node.querySelector('.preview').textContent = (chat.lastBody || '').slice(0, 80);
      const badge = node.querySelector('.badge');
      if (chat.unread > 0) {
        badge.hidden = false;
        badge.textContent = String(chat.unread);
      }
      if (state.activeEmail === email) node.classList.add('active');
      node.addEventListener('click', () => {
        state.activeEmail = email;
        renderChatList();
        renderActiveChat();
      });
      el.chatList.append(node);
    }
  }

  function renderActiveChat() {
    const chat = state.chats.get(state.activeEmail);
    if (!chat) {
      el.chatHeader.textContent = 'Kein Chat ausgewählt';
      el.messages.innerHTML = '<div class="muted">Wähle links einen Chat.</div>';
      return;
    }
    el.chatHeader.textContent = `${chat.email} • ${chat.messages.length} Nachrichten`;
    el.toInput.value = chat.email;
    el.messages.innerHTML = '';
    for (const msg of chat.messages) {
      const bubble = documentRef.createElement('article');
      bubble.className = `bubble ${msg.direction}`;
      bubble.textContent = msg.body;
      const meta = documentRef.createElement('small');
      meta.className = 'meta';
      meta.textContent = fmtDate(msg.date);
      bubble.append(meta);
      el.messages.append(bubble);
    }
    el.messages.scrollTop = el.messages.scrollHeight;
  }

  async function loadAccounts() {
    state.accounts = await browser.accounts.list();
    el.accountSelect.innerHTML = '';
    for (const acc of state.accounts) {
      const opt = documentRef.createElement('option');
      opt.value = acc.id;
      opt.textContent = `${acc.name} (${acc.identities?.[0]?.email || 'ohne Adresse'})`;
      el.accountSelect.append(opt);
    }
    if (state.accounts.length) {
      state.accountId = state.accounts[0].id;
      el.accountSelect.value = String(state.accountId);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    const to = extractEmail(el.toInput.value);
    const body = el.bodyInput.value.trim();
    if (!to || !body || !state.accountId) return;

    el.sendBtn.disabled = true;
    try {
      const account = state.accounts.find((a) => String(a.id) === String(state.accountId));
      const identityId = account?.identities?.[0]?.id;
      const activeChat = state.chats.get(state.activeEmail || to);
      const replyTarget = activeChat?.messages?.at(-1)?.externalMessageId || undefined;

      const details = {
        to: [to],
        body,
        plainTextBody: body,
        isPlainText: true,
        identityId,
        ...(replyTarget ? { inReplyTo: replyTarget, references: [replyTarget] } : {}),
      };

      const tab = await browser.compose.beginNew(details);
      if (tab?.id && browser.compose.sendMessage) {
        await browser.compose.sendMessage(tab.id, { mode: 'sendNow' });
      }

      el.bodyInput.value = '';
      autoGrow();
      await rebuildChats();
    } catch (err) {
      console.error('Senden fehlgeschlagen', err);
      alert(`Senden fehlgeschlagen: ${err.message || err}`);
    } finally {
      el.sendBtn.disabled = false;
    }
  }

  function bind() {
    el.accountSelect.addEventListener('change', async () => {
      state.accountId = el.accountSelect.value;
      state.activeEmail = null;
      await rebuildChats();
      renderActiveChat();
    });
    el.syncBtn.addEventListener('click', () => rebuildChats());
    el.openTabBtn?.addEventListener('click', () => browser.runtime.sendMessage({ type: 'open-mailchat-tab' }));
    el.sendForm.addEventListener('submit', sendMessage);
    el.bodyInput.addEventListener('input', autoGrow);
    el.bodyInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        sendMessage(ev).catch(console.error);
      }
    });
  }

  (async function init() {
    bind();
    await loadAccounts();
    await rebuildChats();
    renderActiveChat();
    autoGrow();
  })();
}
