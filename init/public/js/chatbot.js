const chatBox =
    document.getElementById("chat-box");

const input =
    document.getElementById("userMessage");

const sendBtn =
    document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

function currentTime() {

    return new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit"

    });

}

function scrollBottom() {

    chatBox.scrollTo({

        top: chatBox.scrollHeight,

        behavior: "smooth"

    });

}

function createUserMessage(message) {

    const div =
        document.createElement("div");

    div.className =
        "user-message";

    div.innerHTML = `

        ${message}

        <div class="chat-time">

            ${currentTime()}

        </div>

    `;

    chatBox.appendChild(div);

}

function createBotMessage(message) {

    const div =
        document.createElement("div");

    div.className =
        "bot-message";

    div.innerHTML = `

        🤖 ${message}

        <div class="chat-time">

            ${currentTime()}

        </div>

    `;

    chatBox.appendChild(div);

}

function showTyping() {

    const typing =
        document.createElement("div");

    typing.className =
        "bot-message";

    typing.id =
        "typing";

    typing.innerHTML = `

        <div class="typing">

            <span></span>

            <span></span>

            <span></span>

        </div>

    `;

    chatBox.appendChild(typing);

    scrollBottom();

}

function removeTyping() {

    const typing =
        document.getElementById("typing");

    if (typing) {

        typing.remove();

    }

}

function disableInput() {

    input.disabled = true;

    sendBtn.disabled = true;

    sendBtn.innerHTML =
        "Thinking...";

}

function enableInput() {

    input.disabled = false;

    sendBtn.disabled = false;

    sendBtn.innerHTML =
        "Send";

    input.focus();

}

function appendSuggestions() {

    const suggestions = [

        "🏞 Waterfalls",

        "🏨 Hotels",

        "🍛 Food",

        "🎉 Festivals"

    ];

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "chat-suggestions";

    suggestions.forEach(text => {

        const btn =
            document.createElement("button");

        btn.className =
            "suggest-btn";

        btn.innerHTML =
            text;

        btn.onclick = () => {

            input.value =
                text.replace(/[^a-zA-Z ]/g, "").trim();

            sendMessage();

        };

        wrapper.appendChild(btn);

    });

    chatBox.appendChild(wrapper);

}

async function sendMessage() {

    const message =
        input.value.trim();

    if (!message) return;

    createUserMessage(message);

    input.value = "";
    disableInput();

    scrollBottom();

    showTyping();

    try {

        const response =
            await fetch("/chatbot/ask", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    message

                })

            });

        const data =
            await response.json();

        setTimeout(() => {

            removeTyping();

            createBotMessage(data.reply);
            appendSuggestions();

            enableInput();

            scrollBottom();

        }, 1200);

    }

    catch (err) {

        removeTyping();

        createBotMessage(

            "Unable to connect with AI server."

        );
        enableInput();

    }

}

document
.getElementById("clearChat")
.addEventListener("click", () => {

    chatBox.innerHTML = `

<div class="bot-message">

👋 Chat cleared.

Ask me anything about Jharkhand Tourism.

</div>

`;

});