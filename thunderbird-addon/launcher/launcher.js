document.getElementById('openTab').addEventListener('click', async () => {
  await browser.runtime.sendMessage({ type: 'open-mailchat-tab' });
  window.close();
});

document.getElementById('openSidebar').addEventListener('click', async () => {
  await browser.sidebarAction.open();
  window.close();
});
