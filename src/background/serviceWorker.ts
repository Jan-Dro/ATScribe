chrome.runtime.onInstalled.addListener(() => {
  console.log('Job Autofill Extension installed');
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  console.log('Background received message:', message);
  return true;
});
