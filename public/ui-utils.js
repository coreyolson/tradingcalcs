/**
 * UI Utilities - Modern replacements for alert() and confirm()
 * Uses Bootstrap 5 Toasts and Modals for better UX
 */

const UIUtils = (function() {
    'use strict';

    // Toast container setup
    function ensureToastContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        return container;
    }

    // Confirm modal setup
    function ensureConfirmModal() {
        let modal = document.getElementById('confirmModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'confirmModal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="background: #1a1d23; border: 1px solid rgba(0, 176, 255, 0.3);">
                        <div class="modal-header border-bottom border-secondary">
                            <h5 class="modal-title" style="color: var(--cyan-glow);">
                                <i class="fas fa-question-circle me-2"></i>
                                <span id="confirmModalTitle">Confirm Action</span>
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" style="color: #e0e0e0;">
                            <p id="confirmModalMessage"></p>
                        </div>
                        <div class="modal-footer border-top border-secondary">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmModalConfirmBtn">Confirm</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        return modal;
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in ms (default: 4000)
     */
    function showToast(message, type = 'info', duration = 4000) {
        const container = ensureToastContainer();
        
        // Icon and color mapping
        const typeConfig = {
            success: { icon: 'fa-check-circle', color: 'var(--green-glow)', bg: 'rgba(0, 255, 136, 0.1)' },
            error: { icon: 'fa-exclamation-circle', color: '#ff4444', bg: 'rgba(255, 68, 68, 0.1)' },
            warning: { icon: 'fa-exclamation-triangle', color: '#ffa000', bg: 'rgba(255, 160, 0, 0.1)' },
            info: { icon: 'fa-info-circle', color: 'var(--cyan-glow)', bg: 'rgba(0, 176, 255, 0.1)' }
        };
        
        const config = typeConfig[type] || typeConfig.info;
        
        // Create toast element
        const toastId = `toast-${Date.now()}`;
        const toastEl = document.createElement('div');
        toastEl.id = toastId;
        toastEl.className = 'toast';
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.style.cssText = `
            background: #1a1d23;
            border: 1px solid ${config.color};
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        `;
        
        toastEl.innerHTML = `
            <div class="toast-header" style="background: ${config.bg}; border-bottom: 1px solid ${config.color};">
                <i class="fas ${config.icon} me-2" style="color: ${config.color};"></i>
                <strong class="me-auto" style="color: ${config.color};">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body" style="color: #e0e0e0;">
                ${message}
            </div>
        `;
        
        container.appendChild(toastEl);
        
        // Initialize and show toast
        const toast = new bootstrap.Toast(toastEl, { 
            autohide: true, 
            delay: duration 
        });
        
        toast.show();
        
        // Remove from DOM after hidden
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
        
        return toast;
    }

    /**
     * Show a confirmation dialog (replaces window.confirm())
     * @param {string} message - The confirmation message
     * @param {string} title - Modal title (optional)
     * @param {Object} options - Additional options
     * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
     */
    function showConfirm(message, title = 'Confirm Action', options = {}) {
        return new Promise((resolve) => {
            const modalEl = ensureConfirmModal();
            const modal = new bootstrap.Modal(modalEl);
            
            // Set content
            document.getElementById('confirmModalTitle').textContent = title;
            document.getElementById('confirmModalMessage').textContent = message;
            
            // Update confirm button
            const confirmBtn = document.getElementById('confirmModalConfirmBtn');
            confirmBtn.textContent = options.confirmText || 'Confirm';
            confirmBtn.className = `btn ${options.confirmClass || 'btn-primary'}`;
            
            // Handle confirm
            const handleConfirm = () => {
                cleanup();
                resolve(true);
                modal.hide();
            };
            
            // Handle cancel
            const handleCancel = () => {
                cleanup();
                resolve(false);
                modal.hide();
            };
            
            // Cleanup listeners
            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                modalEl.removeEventListener('hidden.bs.modal', handleCancel);
            };
            
            // Attach listeners
            confirmBtn.addEventListener('click', handleConfirm);
            modalEl.addEventListener('hidden.bs.modal', handleCancel, { once: true });
            
            // Show modal
            modal.show();
        });
    }

    /**
     * Show an error alert (replaces window.alert() for errors)
     * @param {string} message - The error message
     */
    function showError(message) {
        return showToast(message, 'error', 5000);
    }

    /**
     * Show a success message
     * @param {string} message - The success message
     */
    function showSuccess(message) {
        return showToast(message, 'success', 3000);
    }

    /**
     * Show a warning message
     * @param {string} message - The warning message
     */
    function showWarning(message) {
        return showToast(message, 'warning', 4000);
    }

    /**
     * Show an info message
     * @param {string} message - The info message
     */
    function showInfo(message) {
        return showToast(message, 'info', 3000);
    }

    // Public API
    return {
        showToast,
        showConfirm,
        showError,
        showSuccess,
        showWarning,
        showInfo
    };
})();

// Make available globally
window.UIUtils = UIUtils;
