document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.getElementById('action-tooltip');
    const btnAskAi = document.getElementById('btn-ask-ai');
    
    const pendingContext = document.getElementById('pending-context');
    const btnClearContext = document.getElementById('btn-clear-context');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    const chatContainer = document.getElementById('chat-container');
    const pdfCanvas = document.getElementById('pdf-canvas');
    const tutorSidebar = document.querySelector('.tutor-sidebar');
    const btnCloseChat = document.getElementById('btn-close-chat');

    const slides = [
        {
            page: 1,
            title: "Bài 1: Giới thiệu AI Thực Chiến",
            content: `<h3>Tổng quan về Khóa học</h3>
<p style="margin-top: 16px; margin-bottom: 24px;">Khóa học AI Thực chiến giúp học viên nắm bắt tư duy sản phẩm AI và cách xây dựng các ứng dụng thực tế.</p>
<ul>
    <li>Hiểu rõ vòng đời phát triển của một sản phẩm AI.</li>
    <li>Nắm bắt phương pháp đào sâu vấn đề (JTBD) để thiết kế giải pháp đúng.</li>
    <li>Làm quen với các mô hình ngôn ngữ lớn (LLM) và prompt engineering.</li>
</ul>`
        },
        {
            page: 2,
            title: "Bài 2: Kiến trúc hệ thống AI",
            content: `<h3>Các thành phần cốt lõi</h3>
<p style="margin-top: 16px; margin-bottom: 24px;">Một hệ thống AI không chỉ có mô hình mà còn bao gồm nhiều lớp khác nhau.</p>
<ul>
    <li><strong>Data Layer:</strong> Thu thập, lưu trữ và làm sạch dữ liệu.</li>
    <li><strong>Model Layer:</strong> Nơi các mô hình ML/DL hoặc API LLM xử lý thông tin.</li>
    <li><strong>Application Layer:</strong> Giao diện người dùng và business logic.</li>
</ul>`
        },
        {
            page: 3,
            title: "Bài 3: Xử lý dữ liệu",
            content: `<h3>Kỹ thuật Data Cleaning cơ bản</h3>
<p style="margin-top: 16px; margin-bottom: 24px;">Trong quá trình xử lý dữ liệu thực tế, làm sạch dữ liệu đóng vai trò sống còn trước khi đưa vào huấn luyện mô hình.</p>
<ul>
    <li>Một trong những vấn đề thường gặp nhất là Missing Values (Dữ liệu bị thiếu).</li>
    <li><strong>Cách xử lý:</strong> Xóa dòng, Điền khuyết (Mean, Median), hoặc dùng Mô hình dự đoán.</li>
    <li>Việc chọn phương pháp phụ thuộc rất lớn vào phân phối của dữ liệu bài toán cụ thể.</li>
</ul>`
        },
        {
            page: 4,
            title: "Bài 4: Prompt Engineering",
            content: `<h3>Nghệ thuật giao tiếp với AI</h3>
<p style="margin-top: 16px; margin-bottom: 24px;">Prompt Engineering là kỹ năng thiết kế câu lệnh để tối ưu hóa kết quả đầu ra từ LLM.</p>
<ul>
    <li><strong>Zero-shot:</strong> Yêu cầu mô hình làm mà không cần ví dụ.</li>
    <li><strong>Few-shot:</strong> Cung cấp một vài ví dụ để mô hình học theo pattern.</li>
    <li><strong>Chain-of-thought:</strong> Yêu cầu mô hình suy luận từng bước.</li>
</ul>`
        },
        {
            page: 5,
            title: "Bài 5: RAG (Retrieval-Augmented)",
            content: `<h3>Tích hợp tri thức bên ngoài</h3>
<p style="margin-top: 16px; margin-bottom: 24px;">RAG giúp LLM trả lời dựa trên tài liệu riêng biệt thay vì chỉ dùng kiến thức gốc.</p>
<ul>
    <li>Hệ thống truy xuất (Retriever) tìm kiếm thông tin liên quan từ cơ sở dữ liệu vector.</li>
    <li>LLM đóng vai trò tổng hợp (Generator) dựa trên thông tin vừa tìm được.</li>
    <li>Giảm thiểu rủi ro AI bịa thông tin (Hallucination).</li>
</ul>`
        },
        {
            page: 6,
            title: "Bài 6: Đánh giá mô hình",
            content: `<h3>Làm sao biết AI đang làm tốt?</h3>
<p style="margin-top: 16px; margin-bottom: 24px;">Đánh giá mô hình tạo sinh khó hơn mô hình phân loại truyền thống.</p>
<ul>
    <li>Dùng <strong>Golden Set:</strong> Tập dữ liệu chuẩn do con người chấm để làm mốc đối chiếu.</li>
    <li>Đánh giá theo các chiều: Độ chính xác, Tính hợp lý, Giọng điệu và An toàn.</li>
    <li>Sử dụng LLM as a Judge để tự động hóa quá trình đánh giá.</li>
</ul>`
        },
        {
            page: 7,
            title: "Bài 7: Triển khai và Giám sát",
            content: `<h3>Đưa AI vào thực tế</h3>
<p style="margin-top: 16px; margin-bottom: 24px;">Một mô hình chạy tốt trên local chưa chắc đã hoạt động ổn định trên production.</p>
<ul>
    <li><strong>Deployment:</strong> Đóng gói mô hình bằng Docker và triển khai lên Cloud.</li>
    <li><strong>Monitoring:</strong> Giám sát hiệu năng, độ trễ và sự suy giảm chất lượng (Data Drift).</li>
    <li>Xây dựng cơ chế dự phòng (Fallback) khi API của LLM gặp sự cố.</li>
</ul>`
        }
    ];

    let currentSlideIndex = 0;
    let hasContext = false;
    let contextPage = 1;
    let selectedText = "";

    function renderSlide(index) {
        const slide = slides[index];
        contextPage = slide.page;
        
        document.getElementById('slide-title').innerHTML = slide.title;
        document.getElementById('slide-content').innerHTML = slide.content;
        document.getElementById('slide-footer-page').innerHTML = `Trang ${slide.page}/7`;
        
        document.querySelector('.page-status').innerHTML = `Trang <strong>${slide.page}</strong> / 7`;
        document.querySelector('.page-num').innerHTML = `Trang ${slide.page} · 0 note`;
        
        const badgeOutline = document.querySelector('.badge-outline');
        if (badgeOutline) {
            badgeOutline.innerHTML = `Trong slide: ${slide.page}`;
        }
    }
    
    document.querySelector('.btn-side-nav.left').addEventListener('click', () => {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            renderSlide(currentSlideIndex);
            tooltip.classList.add('hidden');
        }
    });

    document.querySelector('.btn-side-nav.right').addEventListener('click', () => {
        if (currentSlideIndex < slides.length - 1) {
            currentSlideIndex++;
            renderSlide(currentSlideIndex);
            tooltip.classList.add('hidden');
        }
    });

    // Render initial slide
    renderSlide(0);

    // --- Real text selection ---
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text.length > 0 && selection.rangeCount > 0) {
            selectedText = text;
        }
    });

    document.addEventListener('mouseup', (e) => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0 && selection.rangeCount > 0) {
            // Check if selection is inside pdfCanvas
            if (pdfCanvas.contains(selection.anchorNode)) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const canvasRect = pdfCanvas.getBoundingClientRect();
                
                const top = rect.top - canvasRect.top - tooltip.offsetHeight - 10;
                let left = rect.left - canvasRect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                if(left < 0) left = 10; // Prevent tooltip going off screen left
                
                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
                tooltip.classList.remove('hidden');
            }
        } else {
            if (!tooltip.contains(e.target)) {
                tooltip.classList.add('hidden');
            }
        }
    });

    tooltip.addEventListener('mousedown', (e) => {
        // Prevent selection from clearing when clicking tooltip
        e.preventDefault();
    });

    // --- Handle "Hỏi AI" button click ---
    btnAskAi.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.classList.add('hidden');
        
        // Open sidebar when clicking Hỏi AI
        tutorSidebar.classList.remove('closed');

        if (selectedText) {
            pendingContext.querySelector('.context-label').innerText = `Đang đính kèm ngữ cảnh (Trang ${contextPage})`;
            pendingContext.querySelector('.context-text').innerText = `"${selectedText}"`;
            pendingContext.classList.remove('hidden');
            hasContext = true;
        }
        
        // Wait for transition before focusing
        setTimeout(() => chatInput.focus(), 300);
        checkInputState();
    });

    if (btnCloseChat) {
        btnCloseChat.addEventListener('click', () => {
            tutorSidebar.classList.add('closed');
        });
    }

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

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        const sentContextText = hasContext ? pendingContext.querySelector('.context-text').innerText : "";
        appendUserMessage(messageText, hasContext, sentContextText, contextPage);
        
        chatInput.value = '';
        chatInput.style.height = 'auto';
        pendingContext.classList.add('hidden');
        
        const isContextAttached = hasContext;
        const currentTargetPage = isContextAttached ? contextPage : null;
        const currentSelectedText = isContextAttached ? selectedText : "";
        
        hasContext = false;
        btnSend.disabled = true;

        const typingId = showTypingIndicator();

        try {
            // Build candidate chunks from slides
            const candidate_chunks = slides.map(s => ({
                document_id: "current-document",
                page: s.page,
                chunk_id: "chunk-" + s.page,
                content: s.title + "\n" + s.content.replace(/<[^>]+>/g, ' ') // Strip HTML
            }));

            const response = await fetch('http://localhost:3000/api/tutor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_query: messageText,
                    selected_text: currentSelectedText,
                    target_page: currentTargetPage,
                    document_id: "current-document",
                    candidate_chunks: candidate_chunks
                })
            });

            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }

            const data = await response.json();
            
            removeMessage(typingId);
            appendAiMessageFromApi(data);
            
        } catch (error) {
            removeMessage(typingId);
            appendAiMessageFromApi({
                answer: "Lỗi kết nối đến server AI. Vui lòng đảm bảo server.py đang chạy.",
                citations: []
            });
            console.error("API error:", error);
        }
    }

    function appendUserMessage(text, withContext, contextText, pageNum) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        
        let contextHtml = '';
        if (withContext) {
            contextHtml = `
                <div class="context-pill">
                    NGỮ CẢNH: TRANG ${pageNum}<br>
                    ${escapeHTML(contextText)}
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

    function appendAiMessageFromApi(data) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message';
        
        let answer = data.answer || "Xin lỗi, đã có lỗi khi lấy câu trả lời.";
        
        // Format newlines
        answer = escapeHTML(answer).replace(/\n/g, '<br>');
        
        let citationHtml = '';
        if (data.citations && data.citations.length > 0) {
            const citePage = data.citations[0].page;
            citationHtml = `<br><span class="context-reference">📍 Trích dẫn: Trang ${citePage}</span>`;
        }

        msgDiv.innerHTML = `
            <div class="bubble">
                ${answer}
                ${citationHtml}
            </div>
        `;
        
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
