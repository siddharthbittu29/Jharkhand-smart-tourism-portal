/* =========================================================
   JHARKHAND TOURISM
   CHATBOT FRONTEND CONTROLLER
   ========================================================= */

(() => {

    "use strict";


    // =====================================================
    // ELEMENTS
    // =====================================================

    const chatBox =
        document.getElementById("chat-box");

    const input =
        document.getElementById("userMessage");

    const sendBtn =
        document.getElementById("sendBtn");

    const clearBtn =
        document.getElementById("clearChat");


    // =====================================================
    // SAFETY CHECK
    // =====================================================

    if (
        !chatBox ||
        !input ||
        !sendBtn
    ) {
        return;
    }


    // =====================================================
    // STATE
    // =====================================================

    let conversationHistory = [];

    let isSending = false;


    const MAX_HISTORY = 8;

    const MAX_MESSAGE_LENGTH = 1200;


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHtml(value) {

        return String(value || "")

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // FORMAT BOT RESPONSE
    // =====================================================

    function formatMessage(message) {

        return escapeHtml(message)
            .replace(/\n/g, "<br>");

    }


    // =====================================================
    // TIME
    // =====================================================

    function currentTime() {

        return new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    // =====================================================
    // SCROLL
    // =====================================================

    function scrollBottom() {

        chatBox.scrollTo({

            top:
                chatBox.scrollHeight,

            behavior:
                "smooth"

        });

    }


    // =====================================================
    // CREATE USER MESSAGE
    // =====================================================

    function createUserMessage(message) {

        const div =
            document.createElement("div");


        div.className =
            "user-message";


        div.innerHTML = `

            <p class="mb-0">

                ${escapeHtml(message)}

            </p>

            <div class="chat-time">

                ${currentTime()}

            </div>

        `;


        chatBox.appendChild(div);

    }


    // =====================================================
    // CREATE BOT MESSAGE
    // =====================================================

    function createBotMessage(message) {

        const div =
            document.createElement("div");


        div.className =
            "bot-message";


        div.innerHTML = `

            <p class="mb-0">

                🤖 ${formatMessage(message)}

            </p>

            <div class="chat-time">

                ${currentTime()}

            </div>

        `;


        chatBox.appendChild(div);

    }


    // =====================================================
    // TYPING INDICATOR
    // =====================================================

    function showTyping() {

        removeTyping();


        const typing =
            document.createElement("div");


        typing.className =
            "bot-message";


        typing.id =
            "typing";


        typing.innerHTML = `

            <div
                class="typing"
                aria-label="Assistant is typing">

                <span></span>

                <span></span>

                <span></span>

            </div>

        `;


        chatBox.appendChild(
            typing
        );


        scrollBottom();

    }


    // =====================================================
    // REMOVE TYPING
    // =====================================================

    function removeTyping() {

        const typing =
            document.getElementById(
                "typing"
            );


        if (typing) {

            typing.remove();

        }

    }


    // =====================================================
    // INPUT STATE
    // =====================================================

    function disableInput() {

        isSending =
            true;


        input.disabled =
            true;


        sendBtn.disabled =
            true;


        sendBtn.innerHTML = `

            <span
                class="spinner-border spinner-border-sm"
                aria-hidden="true">
            </span>

        `;

    }


    function enableInput() {

        isSending =
            false;


        input.disabled =
            false;


        sendBtn.disabled =
            false;


        sendBtn.innerHTML =
            "➤";


        input.focus();

    }


    // =====================================================
    // ADD HISTORY
    // =====================================================

    function addToHistory(
        role,
        content
    ) {

        conversationHistory.push({

            role,

            content

        });


        conversationHistory =
            conversationHistory.slice(
                -MAX_HISTORY
            );

    }


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    async function sendMessage(
        providedMessage = null
    ) {

        if (isSending) {
            return;
        }


        const rawMessage =
            providedMessage !== null

                ? String(providedMessage)

                : input.value;


        const message =
            rawMessage
                .trim()
                .slice(
                    0,
                    MAX_MESSAGE_LENGTH
                );


        if (!message) {

            input.focus();

            return;

        }


        // -----------------------------------------------
        // USER MESSAGE
        // -----------------------------------------------

        createUserMessage(
            message
        );


        input.value =
            "";


        addToHistory(
            "user",
            message
        );


        disableInput();

        showTyping();


        try {

            const response =
                await fetch(
                    "/chatbot/ask",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        credentials:
                            "same-origin",

                        body:
                            JSON.stringify({

                                message,

                                history:
                                    conversationHistory

                            })

                    }
                );


            let data;


            try {

                data =
                    await response.json();

            } catch (jsonError) {

                throw new Error(
                    "Invalid response from chatbot server."
                );

            }


            removeTyping();


            if (!response.ok) {

                throw new Error(

                    data?.reply ||

                    "The tourism assistant is currently unavailable."

                );

            }


            const reply =
                typeof data?.reply === "string" &&
                data.reply.trim()

                    ? data.reply.trim()

                    : "Sorry, I don't have information about that yet.";


            createBotMessage(
                reply
            );


            addToHistory(
                "assistant",
                reply
            );


        } catch (error) {

            removeTyping();


            console.error(
                "⚠️ Chatbot error:",
                error
            );


            createBotMessage(

                error?.message ||

                "I'm having trouble responding right now. Please try again."

            );

        } finally {

            enableInput();

            scrollBottom();

        }

    }


    // =====================================================
    // SEND BUTTON
    // =====================================================

    sendBtn.addEventListener(
        "click",
        () => {

            sendMessage();

        }
    );


    // =====================================================
    // ENTER KEY
    // =====================================================

    input.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    // =====================================================
    // CLEAR CHAT
    // =====================================================

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            () => {

                conversationHistory =
                    [];


                removeTyping();


                chatBox.innerHTML = `

                    <div class="bot-message">

                        <h5>
                            👋 Chat cleared!
                        </h5>

                        <p>

                            Ask me anything about
                            Jharkhand Tourism.

                        </p>

                        <div class="feature-grid">

                            <div class="feature-chip">
                                🗺 Tourist Places
                            </div>

                            <div class="feature-chip">
                                🏨 Hotels
                            </div>

                            <div class="feature-chip">
                                🍛 Local Food
                            </div>

                            <div class="feature-chip">
                                🎉 Festivals
                            </div>

                        </div>

                    </div>

                `;


                input.value =
                    "";


                input.focus();

            }
        );

    }


    // =====================================================
    // QUICK QUESTIONS
    // =====================================================

    document
        .querySelectorAll(".quick-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const question =
                        button.textContent
                            .trim();


                    if (!question) {
                        return;
                    }


                    sendMessage(
                        question
                    );

                }
            );

        });


    // =====================================================
    // INITIAL FOCUS
    // =====================================================

    input.focus();


    // =====================================================
    // OPTIONAL GLOBAL ACCESS
    // Useful for debugging and future UI controls.
    // =====================================================

    window.JharkhandTourismChatbot = {

        sendMessage,

        clear: () => {

            conversationHistory =
                [];


            chatBox.innerHTML =
                "";

        },

        getHistory: () => {

            return [
                ...conversationHistory
            ];

        }

    };


})();