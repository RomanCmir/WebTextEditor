document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editor = document.getElementById('editor');
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const toggleRightSidebar = document.getElementById('toggle-right-sidebar');
    const sidebar = document.getElementById('sidebar');
    const rightSidebar = document.getElementById('right-sidebar');
    const documentName = document.getElementById('document-name');
    const docTitle = document.getElementById('doc-title');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const lineCount = document.getElementById('line-count');
    const currentFont = document.getElementById('current-font');
    const currentFontSize = document.getElementById('current-font-size');
    const zoomLevel = document.getElementById('zoom-level');
    const fontFamily = document.getElementById('font-family');
    const fontSize = document.getElementById('font-size');
    const textColor = document.getElementById('text-color');
    const highlightColor = document.getElementById('highlight-color');
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const underlineBtn = document.getElementById('underline-btn');
    const strikeBtn = document.getElementById('strike-btn');
    const alignLeftBtn = document.getElementById('align-left-btn');
    const alignCenterBtn = document.getElementById('align-center-btn');
    const alignRightBtn = document.getElementById('align-right-btn');
    const alignJustifyBtn = document.getElementById('align-justify-btn');
    const listUlBtn = document.getElementById('list-ul-btn');
    const listOlBtn = document.getElementById('list-ol-btn');
    const insertTableBtn = document.getElementById('insert-table');
    const insertImageBtn = document.getElementById('insert-image');
    const insertLinkBtn = document.getElementById('insert-link');
    const findBtn = document.getElementById('find-btn');
    const replaceBtn = document.getElementById('replace-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const cutBtn = document.getElementById('cut-btn');
    const copyBtn = document.getElementById('copy-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const saveBtn = document.getElementById('save-btn');
    const newDocBtn = document.getElementById('new-doc');
    const openDocBtn = document.getElementById('open-doc');
    const saveDocBtn = document.getElementById('save-doc');
    const printDocBtn = document.getElementById('print-doc');
    const tableModal = document.getElementById('table-modal');
    const linkModal = document.getElementById('link-modal');
    const findModal = document.getElementById('find-modal');
    const insertTableBtnModal = document.getElementById('insert-table-btn');
    const cancelTableBtn = document.getElementById('cancel-table');
    const insertLinkBtnModal = document.getElementById('insert-link-btn');
    const cancelLinkBtn = document.getElementById('cancel-link');
    const linkText = document.getElementById('link-text');
    const linkUrl = document.getElementById('link-url');
    const linkTarget = document.getElementById('link-target');
    const findText = document.getElementById('find-text');
    const replaceText = document.getElementById('replace-text');
    const findNextBtn = document.getElementById('find-next');
    const findPrevBtn = document.getElementById('find-prev');
    const replaceAllBtn = document.getElementById('replace-all-btn');
    const replaceSingleBtn = document.getElementById('replace-btn-modal');
    const matchCase = document.getElementById('match-case');
    const wholeWord = document.getElementById('whole-word');
    const findResults = document.getElementById('find-results');
    const tableRows = document.getElementById('table-rows');
    const tableCols = document.getElementById('table-cols');

    // Sidebar buttons
    const sidebarBold = document.getElementById('sidebar-bold');
    const sidebarItalic = document.getElementById('sidebar-italic');
    const sidebarUnderline = document.getElementById('sidebar-underline');
    const sidebarListUl = document.getElementById('sidebar-list-ul');
    const sidebarListOl = document.getElementById('sidebar-list-ol');
    const sidebarNew = document.getElementById('sidebar-new');
    const sidebarOpen = document.getElementById('sidebar-open');
    const sidebarSave = document.getElementById('sidebar-save');
    const sidebarPrint = document.getElementById('sidebar-print');
    const sidebarZoomIn = document.getElementById('sidebar-zoom-in');
    const sidebarZoomOut = document.getElementById('sidebar-zoom-out');
    const sidebarFullscreen = document.getElementById('sidebar-fullscreen');

    // State variables
    let currentZoom = 100;
    let history = [];
    let historyIndex = -1;
    let savedSelection = null;

    // Initialize the editor
    function initEditor() {
        // Set initial font and size in status bar
        currentFont.textContent = fontFamily.value;
        currentFontSize.textContent = fontSize.options[fontSize.selectedIndex].text;
        
        // Update statistics
        updateStatistics();
        
        // Set up event listeners
        setupEventListeners();
        
        // Save initial state
        saveState();
    }

    // Insert table into editor
    function insertTable() {
        const rows = parseInt(tableRows.value) || 3;
        const cols = parseInt(tableCols.value) || 3;
        
        let tableHtml = '<table border="1" style="width:100%; border-collapse: collapse;">';
        
        for (let i = 0; i < rows; i++) {
            tableHtml += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHtml += `<td style="padding: 8px;">&nbsp;</td>`;
            }
            tableHtml += '</tr>';
        }
        
        tableHtml += '</table>';
        
        insertHtmlAtCursor(tableHtml);
        closeModal(tableModal);
        saveState();
    }

    // Insert link into editor
    function insertLink() {
        const text = linkText.value || linkUrl.value;
        const url = linkUrl.value;
        const target = linkTarget.checked ? ' target="_blank"' : '';
        
        if (url) {
            const linkHtml = `<a href="${url}"${target}>${text}</a>`;
            insertHtmlAtCursor(linkHtml);
            closeModal(linkModal);
            saveState();
        }
    }

    // Find text in editor
    function findTextInEditor(direction = 'next') {
        const text = findText.value;
        if (!text) return;
        
        // Clear previous highlights
        const highlights = editor.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            while (highlight.firstChild) parent.insertBefore(highlight.firstChild, highlight);
            parent.removeChild(highlight);
        });
        
        const editorContent = editor.innerHTML;
        const regexFlags = matchCase.checked ? 'g' : 'gi';
        let regex;
        
        if (wholeWord.checked) {
            regex = new RegExp(`\\b${escapeRegExp(text)}\\b`, regexFlags);
        } else {
            regex = new RegExp(escapeRegExp(text), regexFlags);
        }
        
        const matches = editorContent.match(regex);
        const count = matches ? matches.length : 0;
        
        findResults.textContent = count ? `Найдено: ${count} совпадений` : 'Совпадений не найдено';
        
        if (count) {
            // Highlight all matches
            editor.innerHTML = editorContent.replace(regex, match => `<span class="search-highlight">${match}</span>`);
            
            // Find and scroll to the next/previous match
            const highlights = editor.querySelectorAll('.search-highlight');
            if (highlights.length) {
                let index = -1;
                
                if (savedSelection) {
                    const range = savedSelection;
                    const node = range.startContainer;
                    const offset = range.startOffset;
                    
                    // Find current position
                    for (let i = 0; i < highlights.length; i++) {
                        const highlight = highlights[i];
                        const position = getNodePosition(highlight, node, offset);
                        
                        if (position === 0) {
                            index = i;
                            break;
                        } else if (position > 0) {
                            index = i - 1;
                            break;
                        }
                    }
                    
                    if (index === -1) {
                        index = direction === 'next' ? 0 : highlights.length - 1;
                    } else {
                        index = direction === 'next' ? (index + 1) % highlights.length : 
                                                      (index - 1 + highlights.length) % highlights.length;
                    }
                } else {
                    index = direction === 'next' ? 0 : highlights.length - 1;
                }
                
                const highlight = highlights[index];
                highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Select the found text
                const range = document.createRange();
                range.selectNodeContents(highlight);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Add temporary class for visual feedback
                highlight.classList.add('search-highlight-active');
                setTimeout(() => {
                    highlight.classList.remove('search-highlight-active');
                }, 500);
            }
        }
    }

    // Replace text in editor
    function replaceTextInEditor(all = false) {
        const find = findText.value;
        const replace = replaceText.value;
        
        if (!find) return;
        
        saveSelection();
        
        const editorContent = editor.innerHTML;
        const regexFlags = matchCase.checked ? 'g' : 'gi';
        let regex;
        
        if (wholeWord.checked) {
            regex = new RegExp(`\\b${escapeRegExp(find)}\\b`, regexFlags);
        } else {
            regex = new RegExp(escapeRegExp(find), regexFlags);
        }
        
        if (all) {
            editor.innerHTML = editorContent.replace(regex, replace);
            findResults.textContent = 'Все совпадения заменены';
        } else {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            
            if (selectedText && regex.test(selectedText)) {
                range.deleteContents();
                range.insertNode(document.createTextNode(replace));
            }
            
            findTextInEditor('next');
        }
        
        saveState();
    }

    // Helper function to escape regex special characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Helper function to get node position relative to another node
    function getNodePosition(containerNode, targetNode, targetOffset) {
        const range = document.createRange();
        range.setStart(containerNode, 0);
        range.setEnd(targetNode, targetOffset);
        return range.toString().length;
    }

    // Save current selection
    function saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            savedSelection = range;
        }
    }

    // Restore saved selection
    function restoreSelection() {
        if (savedSelection) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedSelection);
        }
    }

    // Update document statistics
    function updateStatistics() {
        const text = editor.innerText || editor.textContent;
        const charCountValue = text.length;
        const wordCountValue = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lineCountValue = text.split('\n').length;
        
        charCount.textContent = charCountValue;
        wordCount.textContent = wordCountValue;
        lineCount.textContent = lineCountValue;
    }

    // Save editor state to history
    function saveState() {
        // Remove all future states if we're not at the end of history
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        
        // Save current state
        history.push(editor.innerHTML);
        historyIndex++;
        
        // Limit history size
        if (history.length > 50) {
            history.shift();
            historyIndex--;
        }
        
        updateStatistics();
    }

    // Undo last action
    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            editor.innerHTML = history[historyIndex];
            updateStatistics();
        }
    }

    // Redo last undone action
    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            editor.innerHTML = history[historyIndex];
            updateStatistics();
        }
    }

    // Insert HTML at cursor position
    function insertHtmlAtCursor(html) {
        const selection = window.getSelection();
        if (selection.rangeCount) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            const div = document.createElement('div');
            div.innerHTML = html;
            const frag = document.createDocumentFragment();
            
            while (div.firstChild) {
                frag.appendChild(div.firstChild);
            }
            
            range.insertNode(frag);
            
            // Move cursor to the end of inserted content
            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStartAfter(frag.lastChild || frag);
            newRange.setEndAfter(frag.lastChild || frag);
            selection.addRange(newRange);
        }
    }

    // Toggle sidebar visibility
    function toggleSidebarVisibility() {
        sidebar.classList.toggle('sidebar-collapsed');
    }

    // Toggle right sidebar visibility
    function toggleRightSidebarVisibility() {
        rightSidebar.classList.toggle('right-sidebar-collapsed');
    }

    // Open modal dialog
    function openModal(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Close modal dialog
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Zoom in/out
    function adjustZoom(amount) {
        currentZoom += amount;
        if (currentZoom < 50) currentZoom = 50;
        if (currentZoom > 200) currentZoom = 200;
        
        editor.style.transform = `scale(${currentZoom / 100})`;
        editor.style.transformOrigin = 'top left';
        zoomLevel.textContent = `${currentZoom}%`;
    }

    // Toggle fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Ошибка при попытке перейти в полноэкранный режим: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        // Editor events
        editor.addEventListener('input', saveState);
        editor.addEventListener('click', updateToolbarState);
        editor.addEventListener('keyup', updateToolbarState);
        editor.addEventListener('paste', function(e) {
            // Clean up pasted text (remove formatting)
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
            saveState();
        });

        // Sidebar toggle buttons
        toggleSidebar.addEventListener('click', toggleSidebarVisibility);
        toggleRightSidebar.addEventListener('click', toggleRightSidebarVisibility);

        // Document name sync
        documentName.addEventListener('change', function() {
            docTitle.value = this.value;
        });
        docTitle.addEventListener('change', function() {
            documentName.value = this.value;
        });

        // Formatting buttons
        boldBtn.addEventListener('click', function() {
            document.execCommand('bold', false, null);
            updateToolbarState();
            saveState();
        });
        italicBtn.addEventListener('click', function() {
            document.execCommand('italic', false, null);
            updateToolbarState();
            saveState();
        });
        underlineBtn.addEventListener('click', function() {
            document.execCommand('underline', false, null);
            updateToolbarState();
            saveState();
        });
        strikeBtn.addEventListener('click', function() {
            document.execCommand('strikeThrough', false, null);
            updateToolbarState();
            saveState();
        });

        // Alignment buttons
        alignLeftBtn.addEventListener('click', function() {
            document.execCommand('justifyLeft', false, null);
            updateToolbarState();
            saveState();
        });
        alignCenterBtn.addEventListener('click', function() {
            document.execCommand('justifyCenter', false, null);
            updateToolbarState();
            saveState();
        });
        alignRightBtn.addEventListener('click', function() {
            document.execCommand('justifyRight', false, null);
            updateToolbarState();
            saveState();
        });
        alignJustifyBtn.addEventListener('click', function() {
            document.execCommand('justifyFull', false, null);
            updateToolbarState();
            saveState();
        });

        // List buttons
        listUlBtn.addEventListener('click', function() {
            document.execCommand('insertUnorderedList', false, null);
            updateToolbarState();
            saveState();
        });
        listOlBtn.addEventListener('click', function() {
            document.execCommand('insertOrderedList', false, null);
            updateToolbarState();
            saveState();
        });

        // Font and color controls
        fontFamily.addEventListener('change', function() {
            document.execCommand('fontName', false, this.value);
            currentFont.textContent = this.value;
            saveState();
        });
        fontSize.addEventListener('change', function() {
            document.execCommand('fontSize', false, this.value);
            currentFontSize.textContent = this.options[this.selectedIndex].text;
            saveState();
        });
        textColor.addEventListener('input', function() {
            document.execCommand('foreColor', false, this.value);
            saveState();
        });
        highlightColor.addEventListener('input', function() {
            document.execCommand('hiliteColor', false, this.value);
            saveState();
        });

        // Indent buttons
        document.getElementById('increase-indent').addEventListener('click', function() {
            document.execCommand('indent', false, null);
            saveState();
        });
        document.getElementById('decrease-indent').addEventListener('click', function() {
            document.execCommand('outdent', false, null);
            saveState();
        });

        // Insert buttons
        insertTableBtn.addEventListener('click', function() {
            openModal(tableModal);
        });
        insertImageBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.style.maxWidth = '100%';
                        insertHtmlAtCursor(img.outerHTML);
                        saveState();
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
        insertLinkBtn.addEventListener('click', function() {
            openModal(linkModal);
            const selection = window.getSelection();
            if (selection.toString()) {
                linkText.value = selection.toString();
            }
        });

        // Find/replace buttons
        findBtn.addEventListener('click', function() {
            openModal(findModal);
            findText.focus();
        });
        replaceBtn.addEventListener('click', function() {
            openModal(findModal);
            findText.focus();
        });

        // Undo/redo buttons
        undoBtn.addEventListener('click', undo);
        redoBtn.addEventListener('click', redo);

        // Clipboard buttons
        cutBtn.addEventListener('click', function() {
            document.execCommand('cut', false, null);
            saveState();
        });
        copyBtn.addEventListener('click', function() {
            document.execCommand('copy', false, null);
        });
        pasteBtn.addEventListener('click', function() {
            document.execCommand('paste', false, null);
            saveState();
        });

        // Save/print buttons
        saveBtn.addEventListener('click', saveDocument);
        newDocBtn.addEventListener('click', newDocument);
        openDocBtn.addEventListener('click', openDocument);
        saveDocBtn.addEventListener('click', saveDocument);
        printDocBtn.addEventListener('click', printDocument);

        // Modal buttons
        insertTableBtnModal.addEventListener('click', insertTable);
        cancelTableBtn.addEventListener('click', function() {
            closeModal(tableModal);
        });
        insertLinkBtnModal.addEventListener('click', insertLink);
        cancelLinkBtn.addEventListener('click', function() {
            closeModal(linkModal);
        });
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                closeModal(this.closest('.modal'));
            });
        });

        // Find/replace modal buttons
        findNextBtn.addEventListener('click', function() {
            findTextInEditor('next');
        });
        findPrevBtn.addEventListener('click', function() {
            findTextInEditor('prev');
        });
        replaceSingleBtn.addEventListener('click', function() {
            replaceTextInEditor(false);
        });
        replaceAllBtn.addEventListener('click', function() {
            replaceTextInEditor(true);
        });
        findText.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                findTextInEditor('next');
            }
        });

        // Sidebar buttons
        sidebarBold.addEventListener('click', function() {
            document.execCommand('bold', false, null);
            updateToolbarState();
            saveState();
        });
        sidebarItalic.addEventListener('click', function() {
            document.execCommand('italic', false, null);
            updateToolbarState();
            saveState();
        });
        sidebarUnderline.addEventListener('click', function() {
            document.execCommand('underline', false, null);
            updateToolbarState();
            saveState();
        });
        sidebarListUl.addEventListener('click', function() {
            document.execCommand('insertUnorderedList', false, null);
            updateToolbarState();
            saveState();
        });
        sidebarListOl.addEventListener('click', function() {
            document.execCommand('insertOrderedList', false, null);
            updateToolbarState();
            saveState();
        });
        sidebarNew.addEventListener('click', newDocument);
        sidebarOpen.addEventListener('click', openDocument);
        sidebarSave.addEventListener('click', saveDocument);
        sidebarPrint.addEventListener('click', printDocument);
        sidebarZoomIn.addEventListener('click', function() {
            adjustZoom(10);
        });
        sidebarZoomOut.addEventListener('click', function() {
            adjustZoom(-10);
        });
        sidebarFullscreen.addEventListener('click', toggleFullscreen);

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl+Z for undo
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undo();
            }
            // Ctrl+Y for redo
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                redo();
            }
            // Ctrl+B for bold
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                document.execCommand('bold', false, null);
                updateToolbarState();
                saveState();
            }
            // Ctrl+I for italic
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                document.execCommand('italic', false, null);
                updateToolbarState();
                saveState();
            }
            // Ctrl+U for underline
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                document.execCommand('underline', false, null);
                updateToolbarState();
                saveState();
            }
            // Ctrl+F for find
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                openModal(findModal);
                findText.focus();
            }
            // Ctrl+H for replace
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                openModal(findModal);
                findText.focus();
            }
        });

        // Click outside modals to close them
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                closeModal(e.target);
            }
        });
    }

    // Update toolbar button states based on current selection
    function updateToolbarState() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        // Check bold state
        boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        sidebarBold.classList.toggle('active', document.queryCommandState('bold'));
        
        // Check italic state
        italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        sidebarItalic.classList.toggle('active', document.queryCommandState('italic'));
        
        // Check underline state
        underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
        sidebarUnderline.classList.toggle('active', document.queryCommandState('underline'));
        
        // Check strikeThrough state
        strikeBtn.classList.toggle('active', document.queryCommandState('strikeThrough'));
        
        // Check alignment
        alignLeftBtn.classList.toggle('active', document.queryCommandState('justifyLeft'));
        alignCenterBtn.classList.toggle('active', document.queryCommandState('justifyCenter'));
        alignRightBtn.classList.toggle('active', document.queryCommandState('justifyRight'));
        alignJustifyBtn.classList.toggle('active', document.queryCommandState('justifyFull'));
        
        // Update font family in toolbar
        const font = document.queryCommandValue('fontName');
        if (font) {
            const option = Array.from(fontFamily.options).find(opt => opt.value === font);
            if (option) {
                fontFamily.value = option.value;
                currentFont.textContent = option.value;
            }
        }
        
        // Update font size in toolbar
        const size = document.queryCommandValue('fontSize');
        if (size) {
            const option = Array.from(fontSize.options).find(opt => opt.value === size);
            if (option) {
                fontSize.value = option.value;
                currentFontSize.textContent = option.text;
            }
        }
        
        // Update text color
        const color = document.queryCommandValue('foreColor');
        if (color && /^#[0-9A-F]{6}$/i.test(color)) {
            textColor.value = color;
        }
        
        // Update highlight color
        const highlight = document.queryCommandValue('hiliteColor');
        if (highlight && /^#[0-9A-F]{6}$/i.test(highlight)) {
            highlightColor.value = highlight;
        }
    }

    // Create new document
    function newDocument() {
        if (confirm('Создать новый документ? Несохраненные изменения будут потеряны.')) {
            editor.innerHTML = '';
            editor.focus();
            documentName.value = 'Новый документ';
            docTitle.value = 'Новый документ';
            history = [];
            historyIndex = -1;
            saveState();
        }
    }

    // Open document
    function openDocument() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html,.txt,.rtf,.docx';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                if (file.name.endsWith('.txt')) {
                    editor.innerHTML = event.target.result.replace(/\n/g, '<br>');
                } else if (file.name.endsWith('.html')) {
                    editor.innerHTML = event.target.result;
                } else {
                    alert('Формат файла не поддерживается. Пожалуйста, используйте HTML или TXT.');
                    return;
                }
                
                documentName.value = file.name.replace(/\.[^/.]+$/, '');
                docTitle.value = documentName.value;
                history = [];
                historyIndex = -1;
                saveState();
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Save document
    function saveDocument() {
        const content = editor.innerHTML;
        const title = documentName.value || 'Новый документ';
        const blob = new Blob([`<!DOCTYPE html><html><head><title>${title}</title><meta charset="UTF-8"></head><body>${content}</body></html>`], { type: 'text/html' });
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${title}.html`;
        a.click();
    }

    // Print document
    function printDocument() {
        window.print();
    }

    // Initialize the editor
    initEditor();
});

// Проверка авторизации
document.addEventListener('DOMContentLoaded', function() {
const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
window.location.href = 'auth/login.html';
}

// Кнопка выхода
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth/login.html';
});
}
});