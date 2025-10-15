// // content.js

// function getArticleText() {
//   const article = document.querySelector("article");
//   if (article) return article.innerText;

//   // fallback
//   const paragraphs = Array.from(document.querySelectorAll("p"));
//   return paragraphs.map((p) => p.innerText).join("\n");
// }

// chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
//   if (req.type === "GET_ARTICLE_TEXT") {
//     const text = getArticleText();
//     sendResponse({ text });
//   }
// });

function getArticleText() {
  const article = document.querySelector("article");
  if (article) return article.innerText;

  // fallback if no <article> tag found
  const paragraphs = Array.from(document.querySelectorAll("p"));
  return paragraphs.map((p) => p.innerText).join("\n");
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "get_article_text") { // 👈 lowercase
    const text = getArticleText();
    sendResponse({ text });
  }
});
