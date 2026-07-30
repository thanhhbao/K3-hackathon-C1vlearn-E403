document.addEventListener('DOMContentLoaded', () => {
    const targetText = document.getElementById('target-text');
    const tooltip = document.getElementById('action-tooltip');
    const btnAskAi = document.getElementById('btn-ask-ai');
    
    const pendingContext = document.getElementById('pending-context');
    const btnClearContext = document.getElementById('btn-clear-context');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    const chatContainer = document.getElementById('chat-container');
    const pdfCanvas = document.getElementById('pdf-canvas');

    let hasContext = false;
    let contextPage = 12;

    // --- Fake selection on the specific text ---
    targetText.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const rect = targetText.getBoundingClientRect();
        const canvasRect = pdfCanvas.getBoundingClientRect();
        
        const top = rect.top - canvasRect.top - 50; 
        const left = rect.left - canvasRect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.classList.remove('hidden');
    });

    document.addEventListener('click', () => {
        tooltip.classList.add('hidden');
    });

    tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // --- Handle "Hỏi AI" button click ---
    btnAskAi.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.add('hidden');
        
        pendingContext.classList.remove('hidden');
        hasContext = true;
        
        chatInput.focus();
        checkInputState();
    });

    btnClearContext.addEventListener('click', () => {
        pendingContext.classList.add('hidden');
        hasContext = false;
        checkInputState();
    });

    // --- Chat Input Handlers ---
    chatInput.addEventListener('input', checkInputState);
    
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!btnSend.disabled) {
                sendMessage();
            }
        }
    });

    btnSend.addEventListener('click', sendMessage);

    function checkInputState() {
        if (chatInput.value.trim() !== '') {
            btnSend.disabled = false;
        } else {
            btnSend.disabled = true;
        }
        
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    }

    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        appendUserMessage(messageText, hasContext);
        
        chatInput.value = '';
        chatInput.style.height = 'auto';
        pendingContext.classList.add('hidden');
        
        const wasContextAttached = hasContext;
        hasContext = false;
        btnSend.disabled = true;

        const typingId = showTypingIndicator();

        setTimeout(() => {
            removeMessage(typingId);
            appendAiMessage(messageText, wasContextAttached);
        }, 1500);
    }

    function appendUserMessage(text, withContext) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        
        let contextHtml = '';
        if (withContext) {
            contextHtml = `
                <div class="context-pill">
                    NGỮ CẢNH: TRANG 12<br>
                    "Missing Values (Dữ liệu bị thiếu)"
                </div>
            `;
        }
        
        msgDiv.innerHTML = `
            ${contextHtml}
            <div class="bubble">${escapeHTML(text)}</div>
        `;
        
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ai-message`;
        msgDiv.id = 'typing-' + Date.now();
        
        msgDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return msgDiv.id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function appendAiMessage(userText, withContext) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message';
        
        let aiHtml = '';
        
        if (withContext) {
            // Có truyền trang vào ngữ cảnh -> Xử lý mượt mà như spec
            aiHtml = `
                <div class="bubble">
                    Dựa vào nội dung tài liệu, khi xử lý <strong>Dữ liệu bị thiếu (Missing Values)</strong>, bạn có thể thực hiện theo các cách sau:<br><br>
                    1. <strong>Xóa dòng:</strong> Nếu dữ liệu lỗi rất ít (dưới 5%).<br>
                    2. <strong>Điền khuyết (Imputation):</strong> Bằng giá trị trung bình (Mean), trung vị (Median) tùy thuộc vào độ lệch của phân phối dữ liệu.<br>
                    3. <strong>Dùng Model dự đoán:</strong> K-NN hoặc Decision Tree để điền.<br><br>
                    Lưu ý: Không có cách nào là hoàn hảo, tùy thuộc vào đặc thù bài toán bạn đang giải.
                    <br>
                    <span class="context-reference">📍 Trích dẫn: Trang 12</span>
                </div>
            `;
        } else {
            // Không có truyền context -> Thể hiện Conditional Automation
            const lowerText = userText.toLowerCase();
            if (lowerText.includes('trang 12') || lowerText.includes('missing')) {
                // Người dùng hỏi cố tình ép vào trang 12 mà ko bôi đen
                aiHtml = `
                    <div class="bubble">
                        Có vẻ bạn đang hỏi về bài học. VLearn Tutor không chắc chắn bạn đang nói đến chi tiết nào trên slide.<br><br>
                        👉 Xin hãy bôi đen trực tiếp đoạn văn bản trên <strong>Trang 12</strong> và chọn <strong>"Hỏi AI"</strong> để tôi có thể hỗ trợ bạn chính xác nhất nhé!
                    </div>
                `;
            } else {
                // Hỏi bâng quơ
                aiHtml = `
                    <div class="bubble">
                        Xin chào! VLearn Tutor không tìm thấy ngữ cảnh cụ thể cho câu hỏi này.<br><br>
                        Nếu câu hỏi liên quan đến bài giảng, bạn hãy bôi đen đoạn văn cần hỏi trên slide để tôi lấy ngữ cảnh nhé. Nếu đó là lỗi kỹ thuật, tôi sẽ chuyển thông báo này đến cho đội ngũ hỗ trợ (TA).
                    </div>
                `;
            }
        }
        
        msgDiv.innerHTML = aiHtml;
        
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
