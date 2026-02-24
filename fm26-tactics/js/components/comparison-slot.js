/**
 * Comparison Slot Component - Tactic selector for comparison page
 */
const ComparisonSlot = (() => {

    function render(slotId, selectedTactic, onSelect) {
        if (selectedTactic) {
            return `
                <div class="compare-slot filled" id="${slotId}" data-slug="${esc(selectedTactic.slug)}">
                    <div class="compare-slot-name">${esc(selectedTactic.name)}</div>
                    <div class="compare-slot-formation">${esc(selectedTactic.formationFamily)} &middot; ${esc(selectedTactic.primaryStyle)}</div>
                    <button class="btn btn-ghost btn-sm" data-action="change">Change</button>
                </div>
            `;
        }
        return `
            <div class="compare-slot" id="${slotId}">
                <div class="compare-slot-placeholder">Click to select a tactic</div>
            </div>
        `;
    }

    function showSelector(onSelect) {
        const tactics = DataStore.getTactics();

        // Build overlay — NO class names to avoid WordPress/Bootstrap conflicts
        // All styles are inline to guarantee they work in any environment
        const overlay = document.createElement('div');
        overlay.setAttribute('data-fm26-selector', 'overlay');
        overlay.style.cssText = [
            'position:fixed',
            'top:0','left:0','right:0','bottom:0',
            'background:rgba(0,0,0,0.45)',
            'display:flex !important',
            'align-items:center',
            'justify-content:center',
            'z-index:999999',
            'padding:16px',
            'backdrop-filter:blur(4px)',
            'margin:0',
            'border:none',
            'opacity:1',
            'visibility:visible',
            'pointer-events:auto',
            'transform:none',
            'box-sizing:border-box'
        ].join(';');

        const modal = document.createElement('div');
        modal.setAttribute('data-fm26-selector', 'modal');
        modal.style.cssText = [
            'background:#ffffff',
            'border:2px solid #e5e7eb',
            'border-radius:16px',
            'padding:24px',
            'max-width:600px',
            'width:100%',
            'max-height:80vh',
            'overflow-y:auto',
            'display:block !important',
            'opacity:1',
            'visibility:visible',
            'position:relative',
            'transform:none',
            'pointer-events:auto',
            'box-sizing:border-box',
            'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
            'font-size:16px',
            'line-height:1.5',
            'color:#1a1a2e',
            'margin:0'
        ].join(';');

        const title = document.createElement('div');
        title.style.cssText = 'font-size:1.2rem;font-weight:700;margin-bottom:16px;color:#1a1a2e;';
        title.textContent = 'Select a Tactic';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search tactics...';
        searchInput.setAttribute('data-fm26-selector', 'search');
        searchInput.style.cssText = [
            'width:100%',
            'padding:10px 16px',
            'background:#f3f4f6',
            'border:2px solid #e5e7eb',
            'border-radius:12px',
            'font-size:0.9rem',
            'height:44px',
            'outline:none',
            'color:#1a1a2e',
            'box-sizing:border-box',
            'display:block !important',
            'opacity:1',
            'visibility:visible',
            'font-family:inherit',
            'margin:0'
        ].join(';');

        const resultsContainer = document.createElement('div');
        resultsContainer.setAttribute('data-fm26-selector', 'results');
        resultsContainer.style.cssText = 'margin-top:12px;max-height:400px;overflow-y:auto;';

        modal.appendChild(title);
        modal.appendChild(searchInput);
        modal.appendChild(resultsContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        function renderResults(query) {
            const filtered = query
                ? tactics.filter(t => {
                    const h = [t.name, t.author, t.formationFamily, t.primaryStyle].join(' ').toLowerCase();
                    return h.includes(query.toLowerCase());
                })
                : tactics;

            if (!resultsContainer) return;

            resultsContainer.innerHTML = filtered.length === 0
                ? '<div style="text-align:center;padding:32px;color:#6b7280;font-size:0.9rem">No tactics found.</div>'
                : '';

            filtered.forEach(t => {
                const card = document.createElement('div');
                card.setAttribute('data-slug', t.slug);
                card.style.cssText = [
                    'margin-bottom:8px',
                    'padding:12px',
                    'background:#ffffff',
                    'border:2px solid #e5e7eb',
                    'border-radius:12px',
                    'cursor:pointer',
                    'transition:border-color 150ms ease',
                    'box-sizing:border-box'
                ].join(';');

                const nameDiv = document.createElement('div');
                nameDiv.style.cssText = 'font-size:0.95rem;font-weight:700;color:#1a1a2e;';
                nameDiv.textContent = t.name;

                const metaDiv = document.createElement('div');
                metaDiv.style.cssText = 'font-size:0.8rem;color:#6b7280;margin-top:2px;';
                metaDiv.textContent = t.formationFamily + ' \u00B7 ' + t.primaryStyle + ' \u00B7 by ' + t.author;

                card.appendChild(nameDiv);
                card.appendChild(metaDiv);
                resultsContainer.appendChild(card);

                card.addEventListener('mouseenter', function() { this.style.borderColor = '#22c55e'; });
                card.addEventListener('mouseleave', function() { this.style.borderColor = '#e5e7eb'; });
                card.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const tactic = DataStore.getTactic(t.slug);
                    cleanup();
                    if (onSelect && tactic) onSelect(tactic);
                });
            });
        }

        function cleanup() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            document.removeEventListener('keydown', escHandler, true);
        }

        // Close on overlay background click only
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                e.preventDefault();
                e.stopPropagation();
                cleanup();
            }
        });

        // Stop all clicks inside modal from propagating to WordPress
        modal.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Search input events
        searchInput.addEventListener('input', function() {
            renderResults(this.value);
        });
        searchInput.addEventListener('focus', function() {
            this.style.borderColor = '#22c55e';
            this.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.12)';
        });
        searchInput.addEventListener('blur', function() {
            this.style.borderColor = '#e5e7eb';
            this.style.boxShadow = 'none';
        });

        // Close on Escape — use capture phase to beat WordPress handlers
        function escHandler(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cleanup();
            }
        }
        document.addEventListener('keydown', escHandler, true);

        // Render all tactics
        renderResults('');

        // Focus search input after DOM settles
        setTimeout(function() {
            try { searchInput.focus(); } catch(e) {}
        }, 100);
    }

    function esc(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { render, showSelector };
})();
