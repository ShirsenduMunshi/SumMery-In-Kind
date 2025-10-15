document.addEventListener('DOMContentLoaded', () => {

    // Load and display the saved API key if it exists
    chrome.storage.sync.get(['geminiapikey'], ({ geminiapikey }) => {
        if (geminiapikey) {
            document.getElementById('apiKey').value = geminiapikey;
            document.getElementById('storedKey').textContent = geminiapikey;
        }
    });

    // Copy button functionality
    document.getElementById('copyKey').addEventListener('click', () => {
        const storedKey = document.getElementById('storedKey').textContent;
        if (storedKey) {
            navigator.clipboard.writeText(storedKey).then(() => {
                document.getElementById('toost').innerHTML = 'Key copied to clipboard!';
                setTimeout(() => {
                    document.getElementById('toost').innerHTML = '';
                }, 1000);
            });
        } else {
            alert('No key to copy.');
        }
    });

    // Remove button functionality
    document.getElementById('removeKey').addEventListener('click', () => {
        if (confirm('Are you sure you want to remove the stored API key?')) {
            chrome.storage.sync.remove('geminiapikey', () => {
                document.getElementById('apiKey').value = '';
                document.getElementById('storedKey').textContent = '—';
                document.getElementById('toost').innerHTML = 'Key removed successfully.';
                setTimeout(() => {
                    document.getElementById('toost').innerHTML = '';
                }, 1000);
            });
        }
    });

    // Save button functionality
    document.getElementById('saveBtn').addEventListener('click', () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        if (!apiKey) {
            alert('API Key cannot be empty.');
            return;
        }
        chrome.storage.sync.set({ geminiapikey: apiKey }, () => {
            document.getElementById('status').innerHTML = 'Key saved successfully.';
            setTimeout(() => {
                document.getElementById('status').innerHTML = '';
            }, 1000);
        });
    });

    // Reveal button functionality
    document.getElementById('reveal').addEventListener('click', () => {
        const inputApiKey = document.getElementById('apiKey');
        inputApiKey.type = inputApiKey.type === 'password' ? 'text' : 'password';
    });

    // Paste button functionality
    document.getElementById('pasteBtn').addEventListener('click', () => {
        navigator.clipboard.readText().then(text => {
            document.getElementById('apiKey').value = text;
        })
    });

    // Clear button functionality
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('apiKey').value = null;
    });

    //test button functionality
    document.getElementById('testBtn').addEventListener('click', () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        if (!apiKey) {
            alert('API Key cannot be empty.');
            return;
        }
        fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        }).then(response => {
            if (response.ok) {
                document.getElementById('status').innerHTML = 'API Key is valid.';
            } else {
                document.getElementById('status').innerHTML = 'API Key is invalid.';
            }
        }).catch(() => {
            document.getElementById('status').innerHTML = 'Error testing API Key.';
        });
        setTimeout(() => {
            document.getElementById('status').innerHTML = '';
        }, 1000);
    });

    // Apply selected or system theme
    function applyTheme(theme) {
        const page = document.getElementById('page');
        if (!page) return;

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            page.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            page.setAttribute('data-theme', theme);
        }
    }

    // Load and apply saved theme from storage
    chrome.storage.sync.get('theme', (data) => {
        const savedTheme = data.theme || 'system';
        const select = document.getElementById('themeSelect');
        select.value = savedTheme;
        applyTheme(savedTheme);
    });

    // Handle dropdown changes
    document.getElementById('themeSelect').addEventListener('change', (e) => {
        const newTheme = e.target.value;
        chrome.storage.sync.set({ theme: newTheme });
        applyTheme(newTheme);
    });

    // Listen for system theme change if "system" is selected
    const systemMedia = window.matchMedia('(prefers-color-scheme: dark)');
    systemMedia.addEventListener('change', () => {
        chrome.storage.sync.get('theme', (data) => {
            if (data.theme === 'system') {
                applyTheme('system');
            }
        });
    });

    // === Theme Appearance Handling ===
    const themeSelect = document.getElementById("themeSelect");
    const root = document.documentElement;

    // Apply theme based on selection or system
    function applyTheme(mode) {
        if (mode === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.setAttribute("data-theme", prefersDark ? "dark" : "light");
        } else {
            root.setAttribute("data-theme", mode);
        }
        localStorage.setItem("themeMode", mode);
    }

    // Load stored theme
    (function initTheme() {
        const savedTheme = localStorage.getItem("themeMode") || "system";
        themeSelect.value = savedTheme;
        applyTheme(savedTheme);
    })();

    // Listen for changes from dropdown
    themeSelect.addEventListener("change", (e) => {
        applyTheme(e.target.value);
    });

    // Auto-update if system theme changes while "system" is selected
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        const current = localStorage.getItem("themeMode");
        if (current === "system") applyTheme("system");
    });


})