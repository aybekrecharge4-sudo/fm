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

        // Create overlay and append to document.body to avoid overflow clipping
        const overlay = document.createElement('div');
        overlay.className = 'fm26-app modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(4px);';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = 'background:#ffffff;border:2px solid #e5e7eb;border-radius:16px;padding:24px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#1a1a2e;';
        modal.innerHTML = `
            <div style="font-size:1.2rem;font-weight:700;margin-bottom:16px">Select a Tactic</div>
            <input type="text" class="input" id="selectorSearch" placeholder="Search tactics..." style="width:100%;padding:10px 16px;background:#f3f4f6;border:2px solid #e5e7eb;border-radius:12px;font-size:0.9rem;height:44px;outline:none;color:#1a1a2e;box-sizing:border-box;">
            <div id="selectorResults" style="margin-top:12px;max-height:400px;overflow-y:auto"></div>
        `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        function renderResults(query) {
            const filtered = query
                ? tactics.filter(t => {
                    const h = [t.name, t.author, t.formationFamily, t.primaryStyle].join(' ').toLowerCase();
                    return h.includes(query.toLowerCase());
                })
                : tactics;

            const results = overlay.querySelector('#selectorResults');
            if (!results) return;

            results.innerHTML = filtered.map(t => `
                <div class="selector-tactic" style="margin-bottom:8px;padding:12px;background:#ffffff;border:2px solid #e5e7eb;border-radius:12px;cursor:pointer;transition:border-color 150ms ease" data-slug="${esc(t.slug)}">
                    <div style="font-size:0.95rem;font-weight:700;color:#1a1a2e">${esc(t.name)}</div>
                    <div style="font-size:0.8rem;color:#6b7280;margin-top:2px">
                        ${esc(t.formationFamily)} &middot; ${esc(t.primaryStyle)} &middot; by ${esc(t.author)}
                    </div>
                </div>
            `).join('') || '<div style="text-align:center;padding:32px;color:#6b7280">No tactics found.</div>';

            results.querySelectorAll('.selector-tactic').forEach(card => {
                card.addEventListener('mouseenter', () => { card.style.borderColor = '#22c55e'; });
                card.addEventListener('mouseleave', () => { card.style.borderColor = '#e5e7eb'; });
                card.addEventListener('click', () => {
                    const slug = card.dataset.slug;
                    const tactic = DataStore.getTactic(slug);
                    cleanup();
                    if (onSelect && tactic) onSelect(tactic);
                });
            });
        }

        function cleanup() {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        }

        // Close on overlay click (not modal)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup();
        });

        // Prevent clicks inside modal from closing
        modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Search
        const searchInput = overlay.querySelector('#selectorSearch');
        searchInput.addEventListener('input', (e) => renderResults(e.target.value));
        searchInput.addEventListener('focus', () => { searchInput.style.borderColor = '#22c55e'; searchInput.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.12)'; });
        searchInput.addEventListener('blur', () => { searchInput.style.borderColor = '#e5e7eb'; searchInput.style.boxShadow = 'none'; });

        // Close on Escape
        function escHandler(e) {
            if (e.key === 'Escape') cleanup();
        }
        document.addEventListener('keydown', escHandler);

        renderResults('');

        // Focus search input after render
        setTimeout(() => searchInput.focus(), 50);
    }

    function esc(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { render, showSelector };
})();
