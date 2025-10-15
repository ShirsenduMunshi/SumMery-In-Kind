document.getElementById("summarizeBtn").addEventListener("click", async () => {
    const resultDiv = document.getElementById("result");
    const summaryType = document.getElementById("summary_type").value;

    resultDiv.innerHTML = `<div class="loader"></div>`; // fixed className

    try {
        // ✅ Proper way to retrieve from storage
        const data = await chrome.storage.sync.get("geminiapikey");
        const geminiApiKey = data.geminiapikey;
        // console.log("Gemini API Key:", geminiApiKey);

        if (!geminiApiKey) {
            resultDiv.textContent =
                "❌ Please set your Gemini API key in the extension options. Click the gear icon.";
            return;
        }

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
            resultDiv.textContent = "❌ No active tab found.";
            return;
        }

        // Force-inject content.js
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
        });

        // Send message to content script
        chrome.tabs.sendMessage(tab.id, { type: "get_article_text" }, async (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                resultDiv.textContent = "❌ Unable to extract text on this page.";
                return;
            }

            if (!response || !response.text) {
                resultDiv.textContent = "❌ No article text found.";
                return;
            }

            const text = response.text.trim();
            // resultDiv.textContent = text ? text : "❌ No readable text detected.";
            if (!text) {
                resultDiv.textContent = "❌ No readable text detected.";
                return;
            }
            try {
                const geminiSummery = await getGeminiSummary(text, geminiApiKey, summaryType);
                resultDiv.innerHTML = geminiSummery ? marked.parse(geminiSummery) : "❌ No summary received.";
            } catch (error) {
                console.error("Error getting Gemini summary:", error);
                resultDiv.textContent = "❌ Error getting summary from Gemini API.";
                return;
            }
        });
    } catch (err) {
        console.error(err);
        resultDiv.textContent = "❌ Unexpected error occurred.";
    }
});

async function getGeminiSummary(rawText, apiKey, type) {
    const max = 20000; // Adjusted max token limit
    const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

    const promptMap = {
        bullet_points: `Summarize the following text using bullet points. Focus on presenting the key ideas clearly and concisely:\n\n${text}`,
        paragraph: `Summarize the following text into a single, cohesive paragraph:\n\n${text}`,
        detailed: `Provide a detailed summary of the following text, covering all key points, sub-points, and supporting details:\n\n${text}`,
        key_takeaways: `Identify and list the top 3-5 most important key takeaways from the following text:\n\n${text}`,
        short_summary: `Provide a brief summary of the following text, ideally in 2-3 sentences:\n\n${text}`,
        long_summary: `Provide a comprehensive, long summary of the following text, ensuring all major sections and conclusions are covered:\n\n${text}`,
        technical_summary: `Provide a summary of the following text that focuses on the technical details, jargon, methods, and data:\n\n${text}`,
        non_technical_summary: `Provide a non-technical summary of the following text, using simple language suitable for a general audience:\n\n${text}`,
        executive_summary: `Generate an executive summary for the following text. It should be concise, professional, and focus on the main problem, findings, and conclusion/recommendations:\n\n${text}`,
        storytelling_style: `Summarize the following text in a engaging storytelling style, using narrative elements to make the information more memorable:\n\n${text}`,
        pros_cons_analysis: `Analyze the following text and present the information in a clear pros and cons analysis (advantages and disadvantages):\n\n${text}`,
        step_by_step_guide: `Convert the information in the following text into a logical, numbered step-by-step guide:\n\n${text}`,
        timeline_format: `Summarize the key events, milestones, or dates in the following text in a timeline format:\n\n${text}`,
    };
    const prompt = promptMap[type] || promptMap.bullet_points;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [{ "parts": [{ text: prompt }] }],
                "generationConfig": { "temperature": 0.2 }
            })
        })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Gemini API error:", error);
        throw new Error(error?.error?.message || "Error from Gemini API");
    }
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No summary received.";
}

// response to copy button
document.getElementById("CopyBtn").addEventListener("click", () => {
    const resultDiv = document.getElementById("result");
    const textToCopy = resultDiv.innerText || resultDiv.textContent;
    if (!textToCopy || textToCopy.includes("❌")) {
        alert("❌ No valid summary to copy.");
        return;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
        const toost = document.querySelector(".toost");
        toost.style.display = "block";
        setTimeout(() => {
            toost.style.display = "none";
        }, 2000);
        // alert("✅ Summary copied to clipboard!");
    }).catch((err) => {
        console.error("Could not copy text: ", err);
        alert("❌ Failed to copy summary.");
    });
});