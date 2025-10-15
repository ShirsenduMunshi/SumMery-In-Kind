// background.js

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["geminiApiKey"], (result) => {
        if (!result.geminiApiKey) {
            chrome.tabs.create({"url": "options.html"});
            // chrome.storage.sync.set({ geminiApiKey: "" });
        }                       
    // console.log('Extension installed');
})});