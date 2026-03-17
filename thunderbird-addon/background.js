async function openMailchatTab() {
  const url = browser.runtime.getURL('tab/mailchat.html');
  await browser.tabs.create({ url });
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'open-mailchat-tab') return openMailchatTab();
  return undefined;
});

browser.commands.onCommand.addListener((command) => {
  if (command === 'open-mailchat-tab') openMailchatTab().catch(console.error);
});

browser.browserAction.onClicked?.addListener(() => {
  openMailchatTab().catch(console.error);
});
